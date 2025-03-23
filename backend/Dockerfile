FROM php:8.2-apache

# Instalar dependencias
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Instalar extensiones de PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite

# Configurar el documento root de Apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias de PHP
RUN composer install

# Dar permisos necesarios
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# Script de inicio
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

# Puerto por defecto de Apache
EXPOSE 8000

CMD ["/usr/local/bin/start.sh"]