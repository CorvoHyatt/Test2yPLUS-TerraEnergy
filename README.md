# 🏢 Terra Energy - Sistema de Gestión y Predicción

Este proyecto es una aplicación web full-stack que implementa un sistema de gestión para Terra Energy, incluyendo gestión de usuarios, ventas y predicciones basadas en Machine Learning. La aplicación está construida con Laravel (backend), React + TypeScript (frontend) y Python (servicio de ML), utilizando Docker para la contenerización.

## ✨ Características

- 🔐 Autenticación JWT
- 👥 CRUD completo de usuarios
- 💰 Gestión de ventas
- 📊 Reportes de ventas con gráficos interactivos
- 🤖 Predicción de ventas futuras con Machine Learning
- 🎨 Interfaz de usuario moderna con Material-UI
- 🔒 Rutas protegidas
- 🐳 Contenerización con Docker
- 🚀 Despliegue automatizado

## 🛠️ Requisitos Previos

- Docker
- Docker Compose

## 📂 Estructura del Proyecto

```
.
├── backend/           # API Laravel
├── frontend/          # Aplicación React
├── ml_service/        # Servicio de Machine Learning
└── docker-compose.yml # Configuración de Docker
```

### Backend (Laravel)

- API RESTful
- Autenticación JWT
- Migraciones y seeders automáticos
- Validación de datos
- CORS configurado
- Modelos y controladores para usuarios y ventas

### Frontend (React + TypeScript)

- Material-UI para la interfaz
- TypeScript para tipo seguro
- React Router para navegación
- Axios para peticiones HTTP
- Gestión de estado con React Hooks
- Gráficos interactivos con Chart.js

### Servicio de Machine Learning (Python)

- Flask para la API REST
- scikit-learn para los modelos predictivos
- Pandas para manipulación de datos
- Endpoints para entrenamiento y predicción

## 🚀 Instalación y Ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/CorvoHyatt/Test2-TerraEnergy.git
cd Test2-TerraEnergy
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

## 🌐 Acceso a la Aplicación

- Frontend: http://localhost:5173
- Backend API: http://localhost:8001/api
- Servicio ML: http://localhost:5005

### Credenciales por defecto:

- Email: admin@test.com
- Contraseña: password123

## 🔌 Endpoints de la API

### Públicos

- POST `/api/login` - Iniciar sesión

### Protegidos (requieren token JWT)

#### Usuarios
- GET `/api/users` - Listar usuarios
- GET `/api/users/{id}` - Obtener usuario específico
- POST `/api/users` - Crear usuario
- PUT `/api/users/{id}` - Actualizar usuario
- DELETE `/api/users/{id}` - Eliminar usuario

#### Ventas
- GET `/api/sales` - Listar ventas (soporta filtros)
- POST `/api/sales` - Crear venta
- PUT `/api/sales/{id}` - Actualizar venta
- DELETE `/api/sales/{id}` - Eliminar venta

### Endpoints del Servicio ML

- POST `/ml/train` - Entrenar modelo con datos históricos
- POST `/ml/predict` - Generar predicciones

## 💻 Desarrollo

### Estructura de Contenedores

- **frontend**: Servidor de desarrollo React
- **backend**: Servidor PHP/Laravel
- **db**: Base de datos MySQL
- **ml_service**: Servicio de predicción con Python/Flask

### Comandos Útiles

```bash
# Ver logs de contenedores
docker compose logs

# Ejecutar comandos en el contenedor backend
docker compose exec backend <comando>

# Detener contenedores
docker compose down
```

## 🔐 Características de Seguridad

- Autenticación JWT
- Validación de datos en backend
- Contraseñas hasheadas
- CORS configurado
- Rutas protegidas

## 🧰 Tecnologías Utilizadas

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
- Chart.js

### Servicio ML

- Python 3.9
- Flask
- scikit-learn
- pandas
- numpy

### Infraestructura

- Docker
- Nginx
- MySQL

## 📈 Módulo de Predicción de Ventas

El sistema incluye un módulo avanzado de predicción de ventas que:

- Analiza datos históricos de ventas
- Identifica patrones temporales (diarios, mensuales, etc.)
- Genera predicciones para diferentes periodos (7 días, 15 días, 1 mes, 3 meses, 6 meses, 1 año)
- Proporciona intervalos de confianza para las predicciones
- Visualiza las predicciones en gráficos interactivos

Para más detalles sobre el modelo de predicción, consulte el [README del servicio ML](./ml_service/README.md).
