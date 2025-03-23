#!/bin/bash

echo "Esperando que la base de datos esté lista..."
while ! mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; do
    sleep 1
done
echo "Base de datos lista!"

echo "Ejecutando migraciones y seeders..."
php artisan migrate:fresh --seed

# Configurar el puerto de Apache
sed -i "s/Listen 80/Listen 8000/" /etc/apache2/ports.conf
sed -i "s/:80/:8000/" /etc/apache2/sites-enabled/000-default.conf

# Iniciar Apache en primer plano
apache2-foreground