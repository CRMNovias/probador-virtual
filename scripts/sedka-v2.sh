#!/bin/sh
# La V2 en la raíz de probador-sedka.crmnovias.com: copia la V2 ya construida
# (este repo; elige la marca por el dominio) encima de la web de Sedka sin tocar
# su V1, que está en dist/v1 (repo ARS-BRIDAL/probador-virtual-sedka), y deja el
# index.html con el título, el icono y la vista previa de Sedka.
#
# Lo llaman los dos despliegues (.github/workflows/main.yml de cada repo):
#   sh scripts/sedka-v2.sh <dist de la V2> <dist de probador-sedka>
set -e

SRC=${1%/}
DST=${2%/}
if [ ! -f "$SRC/index.html" ] || [ ! -d "$DST" ]; then
  echo "sedka-v2: falta $SRC/index.html o $DST" >&2
  exit 1
fi

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude '/v1/' "$SRC/" "$DST/"
else
  find "$DST" -mindepth 1 -maxdepth 1 ! -name v1 -exec rm -rf {} +
  cp -a "$SRC/." "$DST/"
fi

node "$(dirname "$0")/sedka-index.mjs" "$DST/index.html"

# Del mismo dueño que el resto de la web de Sedka: cada despliegue entra con su usuario.
chown -R --reference="$DST/.." "$DST" 2>/dev/null || true
echo "sedka-v2: V2 en $DST (la V1 sigue en $DST/v1)"
