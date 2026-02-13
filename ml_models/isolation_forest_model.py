"""
Isolation Forest Model for Anomaly Detection
Detects unusual energy consumption patterns in campus buildings
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import json
from datetime import datetime, timedelta
import os

class EnergyAnomalyDetector:
    def __init__(self, n_estimators=100, contamination=0.1, random_state=42):
        """
        Initialize Isolation Forest for anomaly detection
        
        Args:
            n_estimators: Number of trees in the forest
            contamination: Expected proportion of outliers (0.1 = 10%)
            random_state: Random seed for reproducibility
        """
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state,
            max_samples='auto',
            max_features=1.0,
            bootstrap=False,
            n_jobs=-1,
            verbose=0
        )
        self.scaler = StandardScaler()
        self.feature_names = [
            'power', 'energy', 'water', 'gas', 
            'occupancy', 'temperature', 'hour', 'day_of_week'
        ]
        self.is_trained = False
        
    def generate_training_data(self, n_samples=1000):
        """
        Generate synthetic training data for campus energy consumption
        
        Args:
            n_samples: Number of training samples to generate
            
        Returns:
            DataFrame with training data
        """
        np.random.seed(42)
        
        data = []
        for i in range(n_samples):
            # Time features
            hour = np.random.randint(0, 24)
            day_of_week = np.random.randint(0, 7)
            
            # Base consumption patterns (higher during day, weekdays)
            time_factor = 1.0 + 0.5 * np.sin((hour - 6) * np.pi / 12)
            weekday_factor = 1.2 if day_of_week < 5 else 0.8
            
            # Normal patterns
            base_power = 100 * time_factor * weekday_factor
            power = base_power + np.random.normal(0, 15)
            
            energy = power * 0.8 + np.random.normal(0, 10)
            water = 130 + np.random.normal(0, 20)
            gas = 3.5 + np.random.normal(0, 0.5)
            occupancy = 50 * time_factor * weekday_factor + np.random.normal(0, 10)
            temperature = 22 + np.random.normal(0, 2)
            
            # Add some anomalies (10%)
            if np.random.random() < 0.1:
                anomaly_type = np.random.choice(['high_power', 'hvac_fault', 'leak'])
                if anomaly_type == 'high_power':
                    power *= 1.8
                    energy *= 1.7
                elif anomaly_type == 'hvac_fault':
                    power *= 1.5
                    temperature += 5
                elif anomaly_type == 'leak':
                    water *= 2.5
            
            data.append({
                'power': max(0, power),
                'energy': max(0, energy),
                'water': max(0, water),
                'gas': max(0, gas),
                'occupancy': max(0, min(100, occupancy)),
                'temperature': temperature,
                'hour': hour,
                'day_of_week': day_of_week
            })
        
        return pd.DataFrame(data)
    
    def train(self, data=None):
        """
        Train the Isolation Forest model
        
        Args:
            data: DataFrame with training data (if None, generates synthetic data)
        """
        if data is None:
            print("Generating synthetic training data...")
            data = self.generate_training_data(n_samples=1000)
        
        print(f"Training Isolation Forest with {len(data)} samples...")
        
        # Extract features
        X = data[self.feature_names].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        self.is_trained = True
        
        print("✅ Training complete!")
        
        # Calculate training statistics
        predictions = self.model.predict(X_scaled)
        scores = self.model.score_samples(X_scaled)
        
        n_anomalies = np.sum(predictions == -1)
        anomaly_rate = n_anomalies / len(predictions) * 100
        
        print(f"Training Statistics:")
        print(f"  - Total samples: {len(data)}")
        print(f"  - Detected anomalies: {n_anomalies} ({anomaly_rate:.1f}%)")
        print(f"  - Score range: [{scores.min():.3f}, {scores.max():.3f}]")
        
        return self
    
    def predict(self, building_data):
        """
        Predict if building data is anomalous
        
        Args:
            building_data: Dict or DataFrame with building features
            
        Returns:
            Dict with anomaly prediction and details
        """
        if not self.is_trained:
            raise ValueError("Model not trained! Call train() first.")
        
        # Convert to DataFrame if dict
        if isinstance(building_data, dict):
            building_data = pd.DataFrame([building_data])
        
        # Extract and scale features
        X = building_data[self.feature_names].values
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        score = self.model.score_samples(X_scaled)[0]
        
        # Convert score to 0-1 range (higher = more anomalous)
        # Isolation Forest scores are negative, more negative = more normal
        anomaly_score = 1 / (1 + np.exp(score * 2))  # Sigmoid transformation
        
        is_anomaly = prediction == -1
        
        # Determine severity
        if anomaly_score > 0.7:
            severity = 'critical'
        elif anomaly_score > 0.6:
            severity = 'warning'
        else:
            severity = 'normal'
        
        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score),
            'severity': severity,
            'raw_score': float(score),
            'method': 'isolation_forest',
            'features_analyzed': self.feature_names
        }
    
    def predict_batch(self, data):
        """
        Predict anomalies for multiple buildings
        
        Args:
            data: DataFrame with multiple building records
            
        Returns:
            List of prediction dicts
        """
        results = []
        for idx, row in data.iterrows():
            result = self.predict(row.to_dict())
            result['index'] = idx
            results.append(result)
        return results
    
    def save_model(self, filepath='isolation_forest_model.pkl'):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model!")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='isolation_forest_model.pkl'):
        """Load trained model from disk"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
        
        print(f"✅ Model loaded from {filepath}")
        return self


def main():
    """Main function to train and test the model"""
    print("="*60)
    print("🌲 ISOLATION FOREST - ANOMALY DETECTION")
    print("="*60)
    print()
    
    # Create and train model
    detector = EnergyAnomalyDetector(n_estimators=100, contamination=0.1)
    detector.train()
    print()
    
    # Test with normal data
    print("Testing with NORMAL building data:")
    normal_data = {
        'power': 120.5,
        'energy': 95.0,
        'water': 130.0,
        'gas': 3.5,
        'occupancy': 65.0,
        'temperature': 22.5,
        'hour': 14,
        'day_of_week': 2
    }
    result = detector.predict(normal_data)
    print(json.dumps(result, indent=2))
    print()
    
    # Test with anomalous data
    print("Testing with ANOMALOUS building data (high power):")
    anomaly_data = {
        'power': 220.0,  # Very high
        'energy': 180.0,  # Very high
        'water': 135.0,
        'gas': 3.8,
        'occupancy': 45.0,  # Low occupancy with high power
        'temperature': 28.0,  # High temperature
        'hour': 14,
        'day_of_week': 2
    }
    result = detector.predict(anomaly_data)
    print(json.dumps(result, indent=2))
    print()
    
    # Test with HVAC fault
    print("Testing with HVAC FAULT scenario:")
    hvac_fault = {
        'power': 180.0,
        'energy': 145.0,
        'water': 130.0,
        'gas': 3.5,
        'occupancy': 25.0,  # Very low occupancy
        'temperature': 27.0,  # High temp despite high power
        'hour': 10,
        'day_of_week': 3
    }
    result = detector.predict(hvac_fault)
    print(json.dumps(result, indent=2))
    print()
    
    # Save model
    os.makedirs('ml_models/saved_models', exist_ok=True)
    detector.save_model('ml_models/saved_models/isolation_forest_model.pkl')
    print()
    
    # Test batch prediction
    print("Testing BATCH prediction (5 buildings):")
    test_data = detector.generate_training_data(n_samples=5)
    results = detector.predict_batch(test_data)
    
    for i, result in enumerate(results):
        status = "🚨 ANOMALY" if result['is_anomaly'] else "✅ NORMAL"
        print(f"Building {i+1}: {status} (score: {result['anomaly_score']:.3f}, severity: {result['severity']})")
    print()
    
    print("="*60)
    print("✅ Isolation Forest model trained and tested successfully!")
    print("="*60)


if __name__ == "__main__":
    main()
