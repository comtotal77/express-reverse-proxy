#!/bin/bash

# Definir las variables necesarias
APP_NAME="app"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Obtener la última versión de la imagen de Docker Hub
docker pull masterpablo/express_reverse_proxy:master

# Verificar si la versión de la imagen es diferente a la que se está ejecutando
if [ "$(docker images -q masterpablo/express_reverse_proxy:master)" != "$(docker images -q masterpablo/express_reverse_proxy:master)" ]; then

  # Detener la aplicación
  docker-compose -f $DOCKER_COMPOSE_FILE down

  # Actualizar la imagen
  docker-compose -f $DOCKER_COMPOSE_FILE pull masterpablo/express_reverse_proxy:master

  # Volver a iniciar la aplicación
  docker-compose -f $DOCKER_COMPOSE_FILE up -d

fi