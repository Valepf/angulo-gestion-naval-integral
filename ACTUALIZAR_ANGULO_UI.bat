@echo off
setlocal EnableExtensions
chcp 65001 >nul
title ANGULO - Actualizacion visual V11.6

set "APP=%LOCALAPPDATA%\ANGULO_Control_Horas"
set "WEB=%APP%\gestion_naval_web"
set "DATA=%LOCALAPPDATA%\GestionNavalTallerAngulo"
set "SRC=%~dp0ARCHIVOS"

echo.
echo ==============================================
echo   ANGULO - ACTUALIZACION VISUAL V11.6
echo ==============================================
echo.
echo Esta actualizacion elimina solamente los botones:
echo   - "Instalar ANGULO en este dispositivo"
echo   - "Instalar" dentro del sistema
echo.
echo NO modifica empleados, horas, usuarios ni la base de datos.
echo.

if not exist "%WEB%\app.py" (
  echo ERROR: No encontre la instalacion de ANGULO en:
  echo %WEB%
  echo.
  echo Abri primero ANGULO desde el acceso directo del Escritorio y volve a intentar.
  pause
  exit /b 1
)

if exist "%DATA%\server.pid" (
  set /p PID=<"%DATA%\server.pid"
  if defined PID taskkill /PID %PID% /T /F >nul 2>&1
  del /q "%DATA%\server.pid" >nul 2>&1
)

timeout /t 1 /nobreak >nul

copy /Y "%SRC%\templates\login.html" "%WEB%\templates\login.html" >nul || goto :error
copy /Y "%SRC%\templates\base.html" "%WEB%\templates\base.html" >nul || goto :error
copy /Y "%SRC%\static\js\app.js" "%WEB%\static\js\app.js" >nul || goto :error
copy /Y "%SRC%\static\js\service-worker.js" "%WEB%\static\js\service-worker.js" >nul || goto :error
copy /Y "%SRC%\run_background.py" "%WEB%\run_background.py" >nul || goto :error

echo Actualizacion aplicada correctamente.
echo Reiniciando ANGULO...
start "" "%APP%\INICIAR_ANGULO.bat"
echo.
echo LISTO. En el celular, cerra ANGULO y volvelo a abrir desde su icono.
echo.
timeout /t 4 /nobreak >nul
exit /b 0

:error
echo.
echo ERROR: no se pudo copiar uno de los archivos de actualizacion.
echo No se modifico la base de datos.
echo.
pause
exit /b 1
