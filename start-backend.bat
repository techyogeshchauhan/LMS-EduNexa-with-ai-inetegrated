@echo off
echo Starting EduNexa LMS Backend...
echo.

cd backend

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting the backend server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python run.py

pause