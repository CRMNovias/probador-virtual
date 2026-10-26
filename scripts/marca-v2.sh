#!/bin/sh
# La V2 en la raíz del probador de otra marca (probador-sedka y
# probador-outlet.crmnovias.com): copia la V2 ya construida (este repo; elige la
# marca por el dominio) encima de la web de la marca sin tocar su V1, que está en
# dist/v1 (repos ARS-BRIDAL/probador-virtual-sedka y probador-virtual-outlet), y
# deja el index.html con el título, el icono y la vista previa de la marca.
#
# Lo llaman los despliegues (.github/workflows/main.yml de cada repo):
#   sh scripts/marca-v2.sh <sedka|outlet> <dist de la V2> <dist del probador de la marca>
set -e

BRAND=$1
SRC=${2%/}
DST=${3%/}
case "$BRAND" in
  sedka | outlet) ;;
  *)
    echo "marca-v2: marca desconocida «$BRAND» (sedka u outlet)" >&2
    exit 1
    ;;
esac
if [ ! -f "$SRC/index.html" ] || [ ! -d "$DST" ]; then
  echo "marca-v2: falta $SRC/index.html o $DST" >&2
  exit 1
fi

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude '/v1/' "$SRC/" "$DST/"
else
  find "$DST" -mindepth 1 -maxdepth 1 ! -name v1 -exec rm -rf {} +
  cp -a "$SRC/." "$DST/"
fi

node "$(dirname "$0")/marca-index.mjs" "$BRAND" "$DST/index.html"

# Del mismo dueño que el resto de la web de la marca: cada despliegue entra con su usuario.
chown -R --reference="$DST/.." "$DST" 2>/dev/null || true
echo "marca-v2: V2 de $BRAND en $DST (la V1 sigue en $DST/v1)"
