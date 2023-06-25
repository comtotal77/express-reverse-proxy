#!/bin/bash

# Nombre de la imagen y etiqueta
IMAGE_NAME="masterpablo/express-reverse-proxy"
IMAGE_TAG="master"

# Obtiene el hash de la imagen existente
CURRENT_HASH=$(docker inspect -f '{{.Id}}' $IMAGE_NAME:$IMAGE_TAG)

# Obtiene el hash de la imagen en Docker Hub
NEW_HASH=$(docker inspect -f '{{.Id}}' docker.io/$IMAGE_NAME:$IMAGE_TAG)

# Compara los hashes de las dos imágenes
if [ "$CURRENT_HASH" != "$NEW_HASH" ]; then
  echo "La imagen ha cambiado"
  # Detener la aplicación
  docker-compose down

  # Elimina la imagen existente
  docker rmi $IMAGE_NAME:$IMAGE_TAG

  # Volver a iniciar la aplicación
  docker-compose up -d

else
  echo "La imagen no ha cambiado"

fi