#!/bin/bash
APP_NAME="app"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo "Obteniendo la ultima version de la imagen de Docker Hub..."
docker pull masterpablo/express_reverse_proxy:master
echo "¡La imagen se ha obtenido con exito!"

echo "Verificando si la version de la imagen es diferente a la que se esta ejecutando..."
if [ "$(docker images -q masterpablo/express_reverse_proxy:master)" != "$(docker images -q masterpablo/express_reverse_proxy:master)" ]; then
echo "La version de la imagen es diferente a la que se esta ejecutando."


echo "Deteniendo la aplicacion..."
docker-compose -f $DOCKER_COMPOSE_FILE down
echo "¡La aplicacion se ha detenido con exito!"


echo "Actualizando la imagen..."
docker-compose -f $DOCKER_COMPOSE_FILE pull masterpablo/express_reverse_proxy:master
echo "¡La imagen se ha actualizado con exito!"


echo "Volviendo a iniciar la aplicacion..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d
echo "¡La aplicacion se ha iniciado con exito!"

else
echo "La version de la imagen es la misma que la que se esta ejecutando, no es necesario actualizarla."
fi


echo "¡El script ha finalizado con exito!"