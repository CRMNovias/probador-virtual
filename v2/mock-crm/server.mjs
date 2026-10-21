// CRM simulado para desarrollar la V2 sin el CRM de Herd ni tocar producción.
//
// Reproduce las rutas del CRM real que usa el probador, con las mismas formas
// de respuesta que la V1 (también el fondo elegido y la foto en pareja).
// El giro 360 no está aquí: lo hace la V2 (src/lib/server/turntable-bridge.ts).
//
// Con GEMINI_API_KEY (en .env.local) usa IA real como el CRM: avatar y prueba
// con Gemini 3 Pro Image (ver src/lib/server/ai.mjs). Sin clave, el avatar es
// la propia foto y la prueba devuelve el avatar.
//
// Uso: npm run mock   (puerto 4010)
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ai from '../src/lib/server/ai.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.MOCK_PORT ?? 4010);
const BASE = `http://localhost:${PORT}`;
const FAST = process.env.MOCK_FAST === '1';
const DELAY = { otp: 500, avatar: FAST ? 800 : 5000, tryon: FAST ? 800 : 6000 };
const MEDIA = path.join(here, '.data', 'media');
fs.mkdirSync(MEDIA, { recursive: true });

const catalog = JSON.parse(fs.readFileSync(path.join(here, 'catalog.json'), 'utf8'));
const byId = new Map(catalog.map((p) => [p.dressId, p]));

const fresh = () => ({
  user: null,
  hasAvatar: false,
  /** Foto subida por la clienta: { file, mime }. */
  photo: null,
  /** Avatar generado: URL pública servida en /media. */
  avatarUrl: null,
  tryOns: [],
  favorites: new Set(),
  appointments: [],
});
let state = fresh();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BOOKING_SHOPS = [
  { id: 1, name: 'Atelier de Bodas Madrid', address: 'Calle Mayor 1', city: 'Madrid', phone: '+34 910 000 000', email: 'madrid@example.com' },
  { id: 2, name: 'Atelier de Bodas Córdoba', address: 'Av. Gran Capitán 2', city: 'Córdoba', phone: '+34 957 000 000', email: 'cordoba@example.com' },
];

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      try {
        resolve(JSON.parse(raw.toString('utf8')));
      } catch {
        resolve({ raw });
      }
    });
  });

const authed = (req) => (req.headers.authorization ?? '').startsWith('Bearer ');

const readRaw = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

/** Primer fichero de un multipart/form-data (la foto de `user/upload`). */
const parseUpload = (raw, contentType) => {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType ?? '');
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  let start = raw.indexOf(marker);
  while (start !== -1) {
    const next = raw.indexOf(marker, start + marker.length);
    const part = raw.subarray(start + marker.length, next === -1 ? raw.length : next);
    const split = part.indexOf('\r\n\r\n');
    const head = part.subarray(0, split).toString('utf8');
    if (/filename=/.test(head)) {
      const mime = /content-type:\s*([^\r\n]+)/i.exec(head)?.[1]?.trim() ?? 'image/jpeg';
      return { bytes: part.subarray(split + 4, part.length - 2), mime };
    }
    start = next;
  }
  return null;
};

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'video/mp4': 'mp4' };

/** Guarda un medio en /media y devuelve su URL pública. */
const saveMedia = async (name, bytes, mime) => {
  const file = `${name}.${EXT[mime] ?? 'bin'}`;
  await fsp.writeFile(path.join(MEDIA, file), bytes);
  return `${BASE}/media/${file}`;
};

const MIME_BY_EXT = Object.fromEntries(Object.entries(EXT).map(([mime, ext]) => [ext, mime]));

/** Lee una imagen por URL: las de /media desde disco, el resto por HTTP. */
const loadImage = async (url) => {
  if (url.startsWith(`${BASE}/media/`) || url.startsWith(`${BASE}/assets/`)) {
    const dir = url.includes('/media/') ? MEDIA : path.join(here, 'assets');
    const file = path.join(dir, path.basename(url));
    const ext = path.extname(file).slice(1);
    return { bytes: await fsp.readFile(file), mime: MIME_BY_EXT[ext] ?? 'image/png' };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url}`);
  return { bytes: Buffer.from(await res.arrayBuffer()), mime: res.headers.get('content-type') ?? 'image/jpeg' };
};

// --- Rutas -------------------------------------------------------------------

const userView = () => {
  const { weddingDate = null, weddingPlace = null, weddingStyle = null, weddingMoment = null, ...user } = state.user ?? {};
  const wedding = weddingDate || weddingPlace || weddingStyle || weddingMoment ? { date: weddingDate, place: weddingPlace, style: weddingStyle, moment: weddingMoment } : null;
  return { ...user, wedding, hasAvatar: state.hasAvatar };
};
const listing = (kind, q) => {
  let list = catalog.filter((p) => p.kind === kind);
  for (const key of ['brand', 'cut', 'color']) if (q.get(key)) list = list.filter((p) => p[key] === q.get(key));
  if (q.get('q')) list = list.filter((p) => p.name.toLowerCase().includes(q.get('q').toLowerCase()));
  const data = list.map(({ dressId, wpId, name, brand, cut, color, imageUrl }) => ({ dressId, wpId, name, brand, cut, color, imageUrl }));
  return { success: true, data, meta: { page: 1, pageSize: 30, total: data.length, hasMore: false } };
};
const facets = (kind, key) => {
  const counts = {};
  for (const p of catalog) if (p.kind === kind && p[key]) counts[p[key]] = (counts[p[key]] ?? 0) + 1;
  return { success: true, data: Object.entries(counts).map(([label, count]) => ({ label, count })) };
};

const routes = async (req, res, url) => {
  const m = req.method;
  let p = url.pathname.replace(/^\/api/, '');
  p = p.replace(/^\/probador\/atelier\//, '/').replace(/^\/auth\/atelier\//, '/auth/').replace(/^\/atelier\//, '/');

  if (p === '/__reset') {
    state = fresh();
    return json(res, 200, { ok: true });
  }
  if (p === '/__login') {
    // Atajo de desarrollo: deja una clienta con perfil y avatar.
    state.user = { id: '501', phone: '+34612345678', name: 'Laura', email: 'laura@ejemplo.com', createdAt: new Date().toISOString(), shopId: 1 };
    state.hasAvatar = true;
    return json(res, 200, { success: true, data: { token: 'mock-token', user: userView() } });
  }
  if (p.startsWith('/media/') || p.startsWith('/assets/')) {
    const file = p.startsWith('/media/') ? path.join(MEDIA, path.basename(p)) : path.join(here, 'assets', path.basename(p));
    if (!fs.existsSync(file)) return json(res, 404, {});
    const size = fs.statSync(file).size;
    const type = MIME_BY_EXT[path.extname(file).slice(1)] ?? 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
    if (range) {
      const start = Number(range[1] || 0);
      const end = range[2] ? Number(range[2]) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
    return fs.createReadStream(file).pipe(res);
  }

  // Acceso
  if (m === 'POST' && p === '/auth/send-code') {
    await sleep(DELAY.otp);
    // `simulated` solo lo devuelve este simulador: la app avisa de que no llega ningún WhatsApp.
    return json(res, 200, { success: true, message: 'Código enviado', simulated: true });
  }
  if (m === 'POST' && p === '/auth/verify-code') {
    const body = await readBody(req);
    await sleep(DELAY.otp);
    if (body.code === '000000') return json(res, 401, { success: false, error: { code: 'INVALID_CODE', message: 'Código incorrecto' } });
    state.user ??= { id: '501', phone: body.phone, createdAt: new Date().toISOString(), name: null, email: null };
    return json(res, 200, { success: true, data: { token: 'mock-token', user: state.user, hasProfile: Boolean(state.user.name), hasAvatar: state.hasAvatar } });
  }
  if (m === 'GET' && p === '/shops') {
    return json(res, 200, { success: true, data: [{ id: 1, name: 'Atelier de Bodas Madrid' }, { id: 2, name: 'Atelier de Bodas Córdoba' }] });
  }
  if (m === 'GET' && p === '/collections/item') {
    const item = byId.get(url.searchParams.get('dressId') ?? '') ?? catalog.find((x) => String(x.wpId) === url.searchParams.get('wpId'));
    return item ? json(res, 200, { success: true, data: { ...item, category: item.kind === 'suit' ? 'groom' : 'bride' } }) : json(res, 404, { success: false });
  }
  const shareImage = /^\/tryons\/([^/]+)\/image$/.exec(p);
  if (m === 'GET' && shareImage) {
    const t = state.tryOns.find((x) => x.id === shareImage[1]);
    return t ? json(res, 200, { success: true, data: { imageUrl: t.imageUrl } }) : json(res, 404, { success: false });
  }

  if (!authed(req)) return json(res, 401, { message: 'Unauthenticated.' });

  // Perfil
  if (m === 'GET' && p === '/user/profile') return state.user ? json(res, 200, { success: true, data: userView() }) : json(res, 401, {});
  if (m === 'POST' && (p === '/user/create' || p === '/user/update-profile')) {
    const body = await readBody(req);
    const errors = {};
    if (p === '/user/create') {
      if (!body.name || body.name.length < 2) errors.name = ['El nombre es obligatorio.'];
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email ?? '')) errors.email = ['El email no es válido.'];
      if (!body.postcode || body.postcode.length < 3) errors.postcode = ['El código postal es obligatorio.'];
      if (Object.keys(errors).length) return json(res, 422, { message: 'Datos no válidos', errors });
    }
    state.user = { ...state.user, ...body };
    return json(res, 200, { success: true, data: { token: 'mock-token', expiresIn: 3600, merged: false, user: userView() } });
  }
  if (m === 'POST' && p === '/user/upload') {
    const photo = parseUpload(await readRaw(req), req.headers['content-type']);
    if (!photo?.bytes.length) return json(res, 422, { success: false, message: 'No llegó ninguna foto' });
    state.photo = { ...photo, url: await saveMedia(`foto-${Date.now()}`, photo.bytes, photo.mime) };
    return json(res, 200, { success: true, data: { photoUrl: state.photo.url } });
  }

  // Avatar
  const avatarUrl = () => state.avatarUrl ?? `${BASE}/assets/avatar.png`;
  if (m === 'GET' && p === '/avatar') {
    if (!state.hasAvatar) return json(res, 404, { success: false, message: 'Sin avatar' });
    const now = new Date().toISOString();
    return json(res, 200, { success: true, data: { avatarUrl: avatarUrl(), userId: '501', createdAt: now, updatedAt: now } });
  }
  if (m === 'POST' && p === '/avatar/generate') {
    const body = await readBody(req);
    if (!state.photo) return json(res, 422, { success: false, message: 'Primero sube una foto' });
    try {
      if (ai.hasAi()) {
        const avatar = await ai.generateAvatar(body.prompt ?? '', state.photo);
        state.avatarUrl = await saveMedia(`avatar-${Date.now()}`, avatar.bytes, avatar.mime);
      } else {
        // Sin IA no hay avatar: se usa la propia foto, nunca la de ejemplo.
        await sleep(DELAY.avatar);
        state.avatarUrl = state.photo.url;
      }
    } catch (e) {
      console.error('[avatar]', e.message);
      return json(res, 500, { success: false, message: 'La IA no pudo crear el avatar con esta foto. Prueba con otra.' });
    }
    state.hasAvatar = true;
    return json(res, 200, { success: true, data: { avatarUrl: state.avatarUrl, avatarId: 'av1', simulated: !ai.hasAi() } });
  }
  if (m === 'DELETE' && p === '/avatar') {
    state.hasAvatar = false;
    state.avatarUrl = null;
    return json(res, 200, { success: true });
  }
  // Colecciones
  if (m === 'GET' && p === '/collections/brides') return json(res, 200, listing('dress', url.searchParams));
  if (m === 'GET' && p === '/collections/grooms') return json(res, 200, listing('suit', url.searchParams));
  if (m === 'GET' && p === '/collections/brands') return json(res, 200, facets('dress', 'brand'));
  if (m === 'GET' && p === '/collections/bride-cuts') return json(res, 200, facets('dress', 'cut'));
  if (m === 'GET' && p === '/collections/groom-colors') return json(res, 200, facets('suit', 'color'));
  if (m === 'GET' && p === '/collections/groom-suit-types') return json(res, 200, { success: true, data: [{ label: 'Novio', count: 2 }] });

  // Pruebas
  if (m === 'POST' && p === '/tryons/generate') {
    const body = await readBody(req);
    const item = byId.get(String(body.dressId));
    if (!item) return json(res, 422, { success: false, message: 'dressId inválido' });
    if (!state.hasAvatar) return json(res, 422, { success: false, message: 'Primero crea tu avatar' });
    // Pareja, como el CRM: foto en base64 y la prenda que llevará.
    const partnerItem = body.partnerDressId ? byId.get(String(body.partnerDressId)) : null;
    if (body.partnerDressId && (!partnerItem || !body.partnerImage)) {
      return json(res, 422, { success: false, message: 'Sube una foto de tu pareja para hacer la imagen de los dos.' });
    }
    const id = `t${Date.now()}`;
    let imageUrl;
    try {
      if (ai.hasAi()) {
        const [avatar, garment, partnerGarment] = await Promise.all([
          loadImage(avatarUrl()),
          loadImage(item.imageUrl),
          partnerItem ? loadImage(partnerItem.imageUrl) : null,
        ]);
        const partner = partnerItem
          ? { photo: { bytes: Buffer.from(String(body.partnerImage).replace(/^data:[^,]+,/, ''), 'base64'), mime: 'image/jpeg' }, garment: partnerGarment }
          : null;
        const image = await ai.generateTryOn(body.prompt ?? '', avatar, garment, { scene: body.backgroundNote?.trim() || null, partner });
        imageUrl = await saveMedia(`prueba-${id}`, image.bytes, image.mime);
      } else {
        // Sin IA no se puede vestir al avatar: se devuelve el avatar tal cual.
        await sleep(DELAY.tryon);
        imageUrl = avatarUrl();
      }
    } catch (e) {
      console.error('[prueba]', e.message);
      return json(res, 500, { success: false, message: 'Error en procesamiento IA' });
    }
    const tryOn = { id, userId: '501', dressId: item.dressId, imageUrl, createdAt: new Date().toISOString() };
    state.tryOns.unshift(tryOn);
    return json(res, 200, { success: true, message: 'Prueba virtual generada correctamente', data: tryOn });
  }
  if (m === 'GET' && p === '/tryons/user') {
    const groups = new Map();
    for (const t of state.tryOns) {
      const item = byId.get(t.dressId);
      if (!groups.has(t.dressId)) groups.set(t.dressId, { dressId: t.dressId, dressName: item?.name ?? '', dressImageUrl: item?.imageUrl ?? '', tryOns: [] });
      groups.get(t.dressId).tryOns.push(t);
    }
    return json(res, 200, { success: true, data: { total: state.tryOns.length, tryOnsByDress: [...groups.values()] } });
  }
  // Probador V2: el giro 360 de la prueba para el WhatsApp (el CRM real lo sube a S3 y lo manda).
  const turntableVideo = /^\/tryons\/([^/]+)\/turntable-video$/.exec(p);
  if (m === 'POST' && turntableVideo) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const size = Buffer.concat(chunks).length;
    const what = size > 10_000 ? `vídeo 360 (${Math.round(size / 1024)} KB)` : 'foto (sin vídeo 360)';
    console.log(`[whatsapp simulado] prueba ${turntableVideo[1]}: se mandaría ${what}`);
    return json(res, 200, { success: true, data: { sent: true, videoUrl: null } });
  }
  const deleteTryOn = /^\/tryons\/([^/]+)$/.exec(p);
  if (m === 'DELETE' && deleteTryOn) {
    state.tryOns = state.tryOns.filter((x) => x.id !== deleteTryOn[1]);
    return json(res, 200, { success: true });
  }

  // Favoritos
  if (m === 'GET' && p === '/favorites') {
    const favorites = [...state.favorites].map((id, n) => ({ id: `f${n}`, dressId: id, dressName: byId.get(id)?.name ?? id, dressImageUrl: byId.get(id)?.imageUrl ?? null, createdAt: null }));
    return json(res, 200, { success: true, data: { total: favorites.length, favorites } });
  }
  if (m === 'POST' && p === '/favorites/toggle') {
    const id = String((await readBody(req)).dressId);
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    return json(res, 200, { success: true, data: { favorited: state.favorites.has(id) } });
  }

  // Citas
  if (m === 'GET' && p === '/appointments/user') {
    const now = new Date().toISOString().slice(0, 19);
    const sorted = [...state.appointments].sort((a, b) => a.date.localeCompare(b.date));
    return json(res, 200, {
      success: true,
      data: { today: [], upcoming: sorted.filter((a) => a.date >= now), past: sorted.filter((a) => a.date < now).reverse() },
    });
  }
  if (m === 'GET' && p === '/booking/shops') return json(res, 200, { success: true, data: BOOKING_SHOPS });
  if (p === '/booking/services') {
    return json(res, 200, { success: true, data: [{ id: 10, name: 'novia', label: 'Vestido de novia', minDays: 1, maxDays: 30 }, { id: 11, name: 'novio', label: 'Traje de novio', minDays: 1, maxDays: 30 }] });
  }
  if (m === 'POST' && p === '/booking/opening-date') return json(res, 200, {});
  if (m === 'POST' && p === '/booking/closed-days') {
    const closed = [];
    const d = new Date();
    for (let n = 0; n < 45; n++) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) closed.push(d.toISOString().slice(0, 10));
    }
    return json(res, 200, { datestring: closed });
  }
  if (m === 'POST' && p === '/booking/availability') {
    const body = await readBody(req);
    const day = Number(String(body.date).slice(-2));
    if (day % 5 === 0) return json(res, 200, { closed: false, available_hours: {} });
    return json(res, 200, { closed: false, available_hours: { '10:00': 1, '11:30': 1, '13:00': 0, '17:00': 2, '18:30': 1 } });
  }
  if (m === 'POST' && (p === '/booking/book' || p === '/booking/update')) {
    const body = await readBody(req);
    const shop = BOOKING_SHOPS.find((s) => s.id === Number(body.shopId));
    if (!shop || !body.date || !body.hour) return json(res, 422, { success: false, message: 'Faltan datos de la cita.' });
    const location = { name: shop.name, address: shop.address, city: shop.city, phone: shop.phone };
    const appointment = { id: Number(body.appointmentId) || 900 + state.appointments.length, userId: 501, date: `${body.date}T${body.hour}:00`, status: 'Cita Reservada', location, createdAt: '', updatedAt: '' };
    state.appointments = [...state.appointments.filter((a) => a.id !== appointment.id), appointment];
    return json(res, 200, { success: true });
  }
  if (m === 'POST' && p === '/booking/cancel') {
    const body = await readBody(req);
    state.appointments = state.appointments.filter((a) => a.id !== Number(body.appointmentId));
    return json(res, 200, { success: true });
  }

  return json(res, 404, { success: false, message: `mock: ${m} ${p}` });
};

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    routes(req, res, new URL(req.url, BASE)).catch((err) => json(res, 500, { message: String(err) }));
  })
  .listen(PORT, () => console.log(`CRM simulado en ${BASE}${FAST ? ' (modo rápido)' : ''}`));
