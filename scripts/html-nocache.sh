#!/bin/sh
# El index.html no debe cachearse: si el navegador se queda con uno viejo, pide
# un JS que ya no existe y la página no carga. Un asset que falte responde con
# un script que recarga la URL con ?v= para traer el index nuevo.
set -e

MARK="# probador-html-nocache"
SNIPPET=/etc/nginx/snippets/probador-html-nocache.conf
BUST_DIR=/var/www/probador-cache-bust
VERSION=20261029

mkdir -p /etc/nginx/snippets "$BUST_DIR"
cat > "$BUST_DIR/bust.js" << EOF
if (!/[?&]v=${VERSION}(?:&|\$)/.test(location.search)) {
  var u = new URL(location.href);
  u.searchParams.set('v', '${VERSION}');
  location.replace(u.href);
}
EOF

cat > "$SNIPPET" << EOF
location = / {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    try_files /index.html =404;
}
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}
location /assets/ {
    try_files \$uri @probador_asset_bust;
}
location @probador_asset_bust {
    default_type application/javascript;
    add_header Cache-Control "no-store" always;
    root $BUST_DIR;
    rewrite ^ /bust.js break;
}
EOF

changed=0
for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [ -f "$f" ] || continue
  grep -q "probador" "$f" || continue
  grep -q "$MARK" "$f" && continue
  cp "$f" "$f.bak-nocache"
  awk -v mark="$MARK" '
    { lines[NR] = $0 }
    END {
      last = 0
      for (i = NR; i >= 1; i--) {
        if (lines[i] ~ /^[ \t]*}[ \t]*$/) { last = i; break }
      }
      if (last == 0) last = NR
      for (i = 1; i <= NR; i++) {
        if (i == last) print "    include /etc/nginx/snippets/probador-html-nocache.conf; " mark
        print lines[i]
      }
    }
  ' "$f.bak-nocache" > "$f"
  changed=1
done

if [ "$changed" != 1 ]; then
  echo "html-nocache: nginx ya lo tenía, o no hay un sitio de probador"
  exit 0
fi

if nginx -t; then
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    service nginx reload
  fi
  echo "html-nocache: index sin caché y recarga si falta el JS"
  exit 0
fi

echo "html-nocache: nginx -t ha fallado, se revierte" >&2
for f in /etc/nginx/sites-enabled/*.bak-nocache /etc/nginx/conf.d/*.bak-nocache; do
  [ -f "$f" ] || continue
  mv "$f" "${f%.bak-nocache}"
done
exit 1
