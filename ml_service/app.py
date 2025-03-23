from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

class SalesPredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.is_trained = False

    def prepare_data(self, sales_data):
        # Convertir fechas a características numéricas
        df = pd.DataFrame(sales_data)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['day_of_week'] = df['sale_date'].dt.dayofweek
        df['day_of_month'] = df['sale_date'].dt.day
        df['month'] = df['sale_date'].dt.month
        
        # Crear features
        X = df[['day_of_week', 'day_of_month', 'month']].values
        y = df['total_amount'].values
        
        return X, y

    def train(self, sales_data):
        X, y = self.prepare_data(sales_data)
        
        # Si hay muy pocos datos, usar todos para entrenar
        if len(X) < 10:
            self.model.fit(X, y)
        else:
            X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
            self.model.fit(X_train, y_train)
        
        self.is_trained = True

    def predict_next_days(self, days=7):
        if not self.is_trained:
            return None
        
        # Generar fechas para los próximos días
        future_dates = [datetime.now() + timedelta(days=i) for i in range(days)]
        future_X = np.array([[d.weekday(), d.day, d.month] for d in future_dates])
        
        # Realizar predicciones
        predictions = self.model.predict(future_X)
        
        return [{
            'date': date.strftime('%Y-%m-%d'),
            'predicted_amount': max(0, float(amount))  # Asegurar que no haya predicciones negativas
        } for date, amount in zip(future_dates, predictions)]

predictor = SalesPredictor()

@app.route('/train', methods=['POST'])
def train_model():
    data = request.get_json()
    if not data or 'sales' not in data:
        return jsonify({'error': 'No sales data provided'}), 400
    
    try:
        predictor.train(data['sales'])
        return jsonify({'message': 'Model trained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['GET'])
def predict():
    if not predictor.is_trained:
        return jsonify({'error': 'Model not trained yet'}), 400
    
    days = request.args.get('days', default=7, type=int)
    predictions = predictor.predict_next_days(days)
    
    return jsonify({
        'predictions': predictions
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)