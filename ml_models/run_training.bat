@echo off
echo ======================================================================
echo   SMART CAMPUS ENERGY - ML MODELS TRAINING
echo ======================================================================
echo.
echo Installing dependencies...
pip install numpy pandas scikit-learn joblib
echo.
echo Starting training...
echo.
python train_all_models.py
echo.
echo ======================================================================
echo   Training Complete!
echo ======================================================================
pause
