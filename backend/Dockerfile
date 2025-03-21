FROM php:8.2-fpm

# Instalar dependencias y Nginx
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx

# Limpiar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Obtener Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias
RUN composer install

# Generar key de la aplicación
RUN php artisan key:generate

# Permisos de almacenamiento
RUN chmod -R 777 storage bootstrap/cache

# Asegurar que start.sh tenga permisos de ejecución
RUN chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]