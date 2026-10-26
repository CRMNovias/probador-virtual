#!/bin/sh
# Lo llama el despliegue de la V1 de Sedka (repo ARS-BRIDAL/probador-virtual-sedka):
#   sh scripts/sedka-v2.sh <dist de la V2> <dist de probador-sedka>
# Es scripts/marca-v2.sh para Sedka.
exec sh "$(dirname "$0")/marca-v2.sh" sedka "$@"
