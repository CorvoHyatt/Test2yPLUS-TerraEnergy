# 🤖 Servicio de Predicción de Ventas 📈

Este servicio implementa un modelo de predicción de ventas utilizando técnicas de Machine Learning para Terra Energy. 🚀

## 📊 Descripción del Modelo

El modelo utiliza una Regresión Lineal (LinearRegression de scikit-learn) para predecir las ventas futuras basándose en patrones temporales. Las características (features) utilizadas son:

- 📆 Día de la semana (0-6)
- 📅 Día del mes (1-31)
- 🗓️ Mes (1-12)

### 🧠 ¿Por qué estos features?

El modelo asume que las ventas pueden tener patrones temporales como:

- 📉 Variaciones según el día de la semana (ej: más ventas en días laborables)
- 💰 Ciclos mensuales (ej: más ventas a principio/fin de mes)
- 🌡️ Estacionalidad por mes

### 🔄 Proceso de Entrenamiento

1. 📝 Los datos históricos de ventas se transforman en características numéricas
2. ✂️ Si hay suficientes datos (>10 registros), se usa un split 80/20 para training/testing
3. 🧮 El modelo se entrena usando scikit-learn's LinearRegression

## 🔌 Integración con la Aplicación

El servicio se integra con la aplicación principal a través de dos endpoints REST:

### 1. 📡 Endpoint de Entrenamiento (/train)

- 📤 Método: POST
- 📥 Recibe: Lista de ventas históricas
- ⚙️ Acción: Entrena el modelo con los datos proporcionados
- 🖱️ Uso: Se llama automáticamente cuando se cargan los datos en el reporte de ventas

### 2. 🔮 Endpoint de Predicción (/predict)

- 📤 Método: GET
- ⚙️ Parámetros: days (número de días a predecir)
- 📊 Retorna: Lista de predicciones con fecha y monto
- 📈 Uso: Se utiliza para mostrar las predicciones en el gráfico y tabla del reporte

## 🚢 Despliegue

El servicio está containerizado usando Docker y se integra con el stack principal a través de docker-compose. Para iniciar todo el sistema:

```bash
docker-compose up --build
```

## ⚠️ Limitaciones y Mejoras Futuras

1. 🔍 El modelo actual es relativamente simple y podría mejorarse:

   - 🧩 Incorporando más variables (ej: eventos especiales, promociones)
   - 🚀 Usando modelos más sofisticados (ARIMA, Prophet, etc.)
   - 📏 Añadiendo intervalos de confianza a las predicciones

2. 💾 El estado del modelo se pierde al reiniciar el contenedor

   - 💽 Se podría implementar persistencia del modelo entrenado

3. 📋 No hay validación cruzada ni métricas de evaluación
   - 📐 Se podrían añadir métricas como MAE, RMSE, etc.

## 🛠️ Tecnologías Utilizadas

- 🌶️ Flask: Framework web ligero para Python
- 🧠 scikit-learn: Biblioteca de Machine Learning
- 🐼 pandas: Manipulación y análisis de datos
- 🔢 numpy: Computación numérica
- 🦄 gunicorn: Servidor WSGI para producción
