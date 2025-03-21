#!/bin/bash

# Función para esperar que la base de datos esté lista
wait_for_db() {
    echo "Esperando que la base de datos esté lista..."
    while ! php artisan db:monitor > /dev/null 2>&1; do
        sleep 1
    done
    echo "Base de datos lista!"
}

# Esperar a que la base de datos esté disponible
wait_for_db

# Ejecutar migraciones y seeders
echo "Ejecutando migraciones y seeders..."
php artisan migrate:fresh --seed --force

# Iniciar PHP-FPM en segundo plano
php-fpm -D

# Iniciar Nginx en primer plano
nginx -g "daemon off;"