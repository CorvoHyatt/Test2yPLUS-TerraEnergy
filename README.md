# Aplicación de Gestión de Usuarios

Este proyecto es una aplicación web full-stack que implementa un sistema de gestión de usuarios con autenticación JWT. La aplicación está construida con Laravel (backend) y React + TypeScript (frontend), utilizando Docker para la contenerización.

## Características

- 🔐 Autenticación JWT
- 👥 CRUD completo de usuarios
- 🎨 Interfaz de usuario moderna con Material-UI
- 🔒 Rutas protegidas
- 🐳 Contenerización con Docker
- 🚀 Despliegue automatizado

## Requisitos Previos

- Docker
- Docker Compose

## Estructura del Proyecto

```
.
├── backend/           # API Laravel
├── frontend/          # Aplicación React
└── docker-compose.yml # Configuración de Docker
```

### Backend (Laravel)

- API RESTful
- Autenticación JWT
- Migraciones y seeders automáticos
- Validación de datos
- CORS configurado

### Frontend (React + TypeScript)

- Material-UI para la interfaz
- TypeScript para tipo seguro
- React Router para navegación
- Axios para peticiones HTTP
- Gestión de estado con React Hooks

## Instalación y Ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/CorvoHyatt/Test1-TerraEnergy.git
cd Test1-TerraEnergy
```

2. Ejecutar la aplicación:

```bash
docker compose up -d
```

¡Eso es todo! La aplicación realizará automáticamente:

- Construcción de contenedores
- Instalación de dependencias
- Migraciones de base de datos
- Seeders iniciales

## Acceso a la Aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

### Credenciales por defecto:

- Email: admin@admin.com
- Contraseña: password

## Endpoints de la API

### Públicos

- POST `/api/login` - Iniciar sesión

### Protegidos (requieren token JWT)

- GET `/api/users` - Listar usuarios
- GET `/api/users/{id}` - Obtener usuario específico
- POST `/api/users` - Crear usuario
- PUT `/api/users/{id}` - Actualizar usuario
- DELETE `/api/users/{id}` - Eliminar usuario

## Desarrollo

### Estructura de Contenedores

- **frontend**: Servidor de desarrollo React
- **backend**: Servidor PHP/Laravel
- **db**: Base de datos MySQL

### Comandos Útiles

```bash
# Ver logs de contenedores
docker compose logs

# Ejecutar comandos en el contenedor backend
docker compose exec backend <comando>

# Detener contenedores
docker compose down
```

## Características de Seguridad

- Autenticación JWT
- Validación de datos en backend
- Contraseñas hasheadas
- CORS configurado
- Rutas protegidas

## Tecnologías Utilizadas

### Backend

- Laravel 10
- PHP 8.2
- JWT Auth
- MySQL 8.0

### Frontend

- React 18
- TypeScript
- Material-UI
- React Router
- Axios

### Infraestructura

- Docker
- Nginx
- MySQL
