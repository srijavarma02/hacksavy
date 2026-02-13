"""
Random Forest Model for Power Consumption Prediction
Predicts future energy consumption for campus buildings
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from datetime import datetime, timedelta
import os

class PowerConsumptionPredictor:
    def __init__(self, n_estimators=50, max_depth=None, random_state=42):
        """
        Initialize Random Forest for power consumption prediction
        
        Args:
            n_estimators: Number of trees in the forest
            max_depth: Maximum depth of trees (None = unlimited)
            random_state: Random seed for reproducibility
        """
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            max_features=0.8,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1,
            verbose=0
        )
        self.scaler_X = StandardScaler()
        self.scaler_y = StandardScaler()
        
        self.feature_names = [
            'energy', 'water', 'gas', 'occupancy', 
            'temperature', 'hour', 'day_of_week'
        ]
        self.target_name = 'power'
        self.is_trained = False
        self.training_metrics = {}
        
    def generate_training_data(self, n_samples=1000):
        """
        Generate synthetic training data for power consumption prediction
        
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
            
            # Time-based patterns
            time_factor = 1.0 + 0.5 * np.sin((hour - 6) * np.pi / 12)
            weekday_factor = 1.2 if day_of_week < 5 else 0.8
            
            # Base power consumption
            base_power = 100 * time_factor * weekday_factor
            
            # Correlated features
            occupancy = 50 * time_factor * weekday_factor + np.random.normal(0, 10)
            occupancy = max(0, min(100, occupancy))
            
            # Power increases with occupancy
            occupancy_effect = occupancy * 0.5
            
            # Temperature affects power (HVAC usage)
            temperature = 22 + np.random.normal(0, 2)
            temp_effect = abs(temperature - 22) * 2  # More power when temp deviates from 22°C
            
            # Calculate power with all effects
            power = base_power + occupancy_effect + temp_effect + np.random.normal(0, 10)
            power = max(50, power)  # Minimum power
            
            # Other features correlated with power
            energy = power * 0.8 + np.random.normal(0, 5)
            water = 100 + occupancy * 0.5 + np.random.normal(0, 15)
            gas = 3.0 + (power / 100) * 0.5 + np.random.normal(0, 0.3)
            
            data.append({
                'power': power,
                'energy': max(0, energy),
                'water': max(0, water),
                'gas': max(0, gas),
                'occupancy': occupancy,
                'temperature': temperature,
                'hour': hour,
                'day_of_week': day_of_week
            })
        
        return pd.DataFrame(data)
    
    def train(self, data=None, test_size=0.2):
        """
        Train the Random Forest model
        
        Args:
            data: DataFrame with training data (if None, generates synthetic data)
            test_size: Proportion of data to use for testing
        """
        if data is None:
            print("Generating synthetic training data...")
            data = self.generate_training_data(n_samples=1000)
        
        print(f"Training Random Forest with {len(data)} samples...")
        
        # Split features and target
        X = data[self.feature_names].values
        y = data[self.target_name].values.reshape(-1, 1)
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Scale features and target
        X_train_scaled = self.scaler_X.fit_transform(X_train)
        X_test_scaled = self.scaler_X.transform(X_test)
        y_train_scaled = self.scaler_y.fit_transform(y_train).ravel()
        
        # Train model
        self.model.fit(X_train_scaled, y_train_scaled)
        self.is_trained = True
        
        print("✅ Training complete!")
        
        # Evaluate on test set
        y_pred_scaled = self.model.predict(X_test_scaled)
        y_pred = self.scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).ravel()
        y_test_actual = y_test.ravel()
        
        # Calculate metrics
        mae = mean_absolute_error(y_test_actual, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test_actual, y_pred))
        r2 = r2_score(y_test_actual, y_pred)
        
        # Calculate accuracy within ±10%
        within_10_percent = np.mean(np.abs(y_pred - y_test_actual) / y_test_actual <= 0.1) * 100
        
        self.training_metrics = {
            'mae': mae,
            'rmse': rmse,
            'r2_score': r2,
            'accuracy_10_percent': within_10_percent,
            'train_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        print(f"\nTraining Metrics:")
        print(f"  - Train samples: {len(X_train)}")
        print(f"  - Test samples: {len(X_test)}")
        print(f"  - Mean Absolute Error: {mae:.2f} kW")
        print(f"  - Root Mean Square Error: {rmse:.2f} kW")
        print(f"  - R² Score: {r2:.3f}")
        print(f"  - Accuracy (±10%): {within_10_percent:.1f}%")
        
        # Feature importance
        feature_importance = self.model.feature_importances_
        print(f"\nFeature Importance:")
        for name, importance in zip(self.feature_names, feature_importance):
            print(f"  - {name}: {importance:.3f}")
        
        return self
    
    def predict(self, building_data):
        """
        Predict power consumption for building
        
        Args:
            building_data: Dict or DataFrame with building features
            
        Returns:
            Dict with prediction and confidence
        """
        if not self.is_trained:
            raise ValueError("Model not trained! Call train() first.")
        
        # Convert to DataFrame if dict
        if isinstance(building_data, dict):
            building_data = pd.DataFrame([building_data])
        
        # Extract and scale features
        X = building_data[self.feature_names].values
        X_scaled = self.scaler_X.transform(X)
        
        # Predict
        y_pred_scaled = self.model.predict(X_scaled)
        y_pred = self.scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1))[0, 0]
        
        # Calculate prediction interval (using tree predictions)
        tree_predictions = []
        for tree in self.model.estimators_:
            tree_pred_scaled = tree.predict(X_scaled)
            tree_pred = self.scaler_y.inverse_transform(tree_pred_scaled.reshape(-1, 1))[0, 0]
            tree_predictions.append(tree_pred)
        
        std_dev = np.std(tree_predictions)
        confidence = 0.85 if self.training_metrics.get('r2_score', 0) > 0.8 else 0.70
        
        return {
            'predicted_power': float(y_pred),
            'confidence': float(confidence),
            'std_dev': float(std_dev),
            'prediction_interval': {
                'lower': float(y_pred - 1.96 * std_dev),
                'upper': float(y_pred + 1.96 * std_dev)
            },
            'unit': 'kW'
        }
    
    def predict_next_hours(self, building_data, hours=24):
        """
        Predict power consumption for next N hours
        
        Args:
            building_data: Dict with current building features
            hours: Number of hours to predict
            
        Returns:
            List of predictions for each hour
        """
        if not self.is_trained:
            raise ValueError("Model not trained! Call train() first.")
        
        current_hour = building_data.get('hour', datetime.now().hour)
        current_day = building_data.get('day_of_week', datetime.now().weekday())
        
        predictions = []
        
        for i in range(hours):
            # Calculate future hour and day
            future_hour = (current_hour + i) % 24
            future_day = (current_day + (current_hour + i) // 24) % 7
            
            # Create future data point
            future_data = building_data.copy()
            future_data['hour'] = future_hour
            future_data['day_of_week'] = future_day
            
            # Adjust occupancy and temperature based on time
            time_factor = 1.0 + 0.5 * np.sin((future_hour - 6) * np.pi / 12)
            weekday_factor = 1.2 if future_day < 5 else 0.8
            
            future_data['occupancy'] = 50 * time_factor * weekday_factor
            future_data['temperature'] = 22 + np.random.normal(0, 1)
            
            # Predict
            result = self.predict(future_data)
            predictions.append({
                'hour': future_hour,
                'day': future_day,
                'predicted_power': result['predicted_power'],
                'confidence': result['confidence']
            })
        
        return predictions
    
    def save_model(self, filepath='random_forest_model.pkl'):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model!")
        
        model_data = {
            'model': self.model,
            'scaler_X': self.scaler_X,
            'scaler_y': self.scaler_y,
            'feature_names': self.feature_names,
            'target_name': self.target_name,
            'is_trained': self.is_trained,
            'training_metrics': self.training_metrics
        }
        
        joblib.dump(model_data, filepath)
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='random_forest_model.pkl'):
        """Load trained model from disk"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler_X = model_data['scaler_X']
        self.scaler_y = model_data['scaler_y']
        self.feature_names = model_data['feature_names']
        self.target_name = model_data['target_name']
        self.is_trained = model_data['is_trained']
        self.training_metrics = model_data['training_metrics']
        
        print(f"✅ Model loaded from {filepath}")
        return self


def main():
    """Main function to train and test the model"""
    print("="*60)
    print("🎯 RANDOM FOREST - POWER CONSUMPTION PREDICTION")
    print("="*60)
    print()
    
    # Create and train model
    predictor = PowerConsumptionPredictor(n_estimators=50)
    predictor.train()
    print()
    
    # Test prediction
    print("Testing SINGLE prediction:")
    test_data = {
        'energy': 95.0,
        'water': 130.0,
        'gas': 3.5,
        'occupancy': 65.0,
        'temperature': 22.5,
        'hour': 14,
        'day_of_week': 2
    }
    result = predictor.predict(test_data)
    print(json.dumps(result, indent=2))
    print()
    
    # Test 24-hour prediction
    print("Testing 24-HOUR forecast:")
    forecast = predictor.predict_next_hours(test_data, hours=24)
    
    print("\nFirst 6 hours:")
    for pred in forecast[:6]:
        print(f"  Hour {pred['hour']:02d}: {pred['predicted_power']:.1f} kW (confidence: {pred['confidence']:.0%})")
    
    print(f"\n  ... (showing 6 of 24 hours)")
    print()
    
    # Peak and low predictions
    powers = [p['predicted_power'] for p in forecast]
    peak_idx = np.argmax(powers)
    low_idx = np.argmin(powers)
    
    print(f"Peak consumption: {powers[peak_idx]:.1f} kW at hour {forecast[peak_idx]['hour']:02d}")
    print(f"Lowest consumption: {powers[low_idx]:.1f} kW at hour {forecast[low_idx]['hour']:02d}")
    print()
    
    # Save model
    os.makedirs('ml_models/saved_models', exist_ok=True)
    predictor.save_model('ml_models/saved_models/random_forest_model.pkl')
    print()
    
    # Test multiple predictions
    print("Testing BATCH predictions (5 different scenarios):")
    test_scenarios = [
        {'name': 'Morning Low', 'hour': 6, 'occupancy': 20},
        {'name': 'Morning Peak', 'hour': 9, 'occupancy': 80},
        {'name': 'Afternoon', 'hour': 14, 'occupancy': 70},
        {'name': 'Evening', 'hour': 18, 'occupancy': 50},
        {'name': 'Night', 'hour': 22, 'occupancy': 10}
    ]
    
    for scenario in test_scenarios:
        data = {
            'energy': 95.0,
            'water': 130.0,
            'gas': 3.5,
            'occupancy': scenario['occupancy'],
            'temperature': 22.5,
            'hour': scenario['hour'],
            'day_of_week': 2
        }
        result = predictor.predict(data)
        print(f"{scenario['name']:15s}: {result['predicted_power']:6.1f} kW (±{result['std_dev']:4.1f})")
    print()
    
    print("="*60)
    print("✅ Random Forest model trained and tested successfully!")
    print("="*60)


if __name__ == "__main__":
    main()
