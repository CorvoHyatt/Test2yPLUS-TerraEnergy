from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import traceback

app = Flask(__name__)
# Configurar CORS para permitir solicitudes desde cualquier origen
CORS(app, resources={r"/*": {"origins": "*"}})

class SalesPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.last_sales_mean = 0
        self.last_sales_std = 0

    def prepare_data(self, sales_data):
        df = pd.DataFrame(sales_data)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        
        # Características temporales
        df['day_of_week'] = df['sale_date'].dt.dayofweek
        df['day_of_month'] = df['sale_date'].dt.day
        df['month'] = df['sale_date'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Características de tendencia
        df = df.sort_values('sale_date')
        df['sales_moving_avg_7d'] = df['total_amount'].rolling(window=7, min_periods=1).mean()
        df['sales_moving_std_7d'] = df['total_amount'].rolling(window=7, min_periods=1).std()
        
        # Guardar estadísticas para usar en predicciones
        self.last_sales_mean = df['total_amount'].mean()
        self.last_sales_std = df['total_amount'].std()
        
        X = df[[
            'day_of_week', 
            'day_of_month', 
            'month', 
            'is_weekend',
            'sales_moving_avg_7d',
            'sales_moving_std_7d'
        ]].values
        
        y = df['total_amount'].values
        
        # Normalizar características
        X = self.scaler.fit_transform(X)
        
        return X, y

    def train(self, sales_data):
        if not sales_data:
            raise ValueError("No hay datos de ventas para entrenar el modelo")
            
        X, y = self.prepare_data(sales_data)
        
        if len(X) < 10:
            self.model.fit(X, y)
        else:
            X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
            self.model.fit(X_train, y_train)
        
        self.is_trained = True

    def predict_next_days(self, days=7):
        if not self.is_trained:
            return None
        
        future_dates = [datetime.now() + timedelta(days=i) for i in range(days)]
        
        # Preparar características para predicción
        future_features = []
        for d in future_dates:
            features = [
                d.weekday(),
                d.day,
                d.month,
                1 if d.weekday() >= 5 else 0,
                self.last_sales_mean,
                self.last_sales_std
            ]
            future_features.append(features)
        
        future_X = np.array(future_features)
        future_X = self.scaler.transform(future_X)
        
        # Realizar predicciones
        predictions = self.model.predict(future_X)
        
        # Calcular intervalos de confianza aproximados (usando la desviación estándar histórica)
        confidence_interval = self.last_sales_std * 1.96  # 95% intervalo de confianza
        
        return [{
            'date': date.strftime('%Y-%m-%d'),
            'predicted_amount': max(0, float(pred)),
            'lower_bound': max(0, float(pred - confidence_interval)),
            'upper_bound': float(pred + confidence_interval)
        } for date, pred in zip(future_dates, predictions)]

predictor = SalesPredictor()

@app.route('/ml/train', methods=['POST'])
def train_model():
    try:
        data = request.get_json()
        if not data or 'sales' not in data:
            return jsonify({'error': 'No se proporcionaron datos de ventas'}), 400
        
        sales_data = data['sales']
        print(f"Datos recibidos: {len(sales_data)} registros")
        
        if not sales_data:
            return jsonify({'error': 'Lista de ventas vacía'}), 400
            
        predictor.train(sales_data)
        print("Modelo entrenado exitosamente")
        return jsonify({'message': 'Modelo entrenado correctamente'})
        
    except Exception as e:
        print(f"Error en entrenamiento: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/ml/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prediction_period = int(data.get('predictionPeriod', 7))
        
        if not predictor.is_trained:
            return jsonify({'error': 'El modelo no ha sido entrenado'}), 400
        
        predictions = predictor.predict_next_days(prediction_period)
        if predictions is None:
            return jsonify({'error': 'Error al generar predicciones'}), 500
            
        return jsonify(predictions)
    
    except Exception as e:
        print(f"Error en predicción: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)