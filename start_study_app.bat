@echo off
echo Starting 3D Printer Study App Server...
echo This is required for AI features to work correctly.
echo.
start "" "http://localhost:8000/index.html"
python -m http.server 8000
pause
