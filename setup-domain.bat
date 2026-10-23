@echo off
:: Batch script to map eventease.bmsce to 127.0.0.1 in Windows hosts file
echo Requesting administrator privileges to update hosts file...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please right-click this file and select "Run as administrator".
    pause
    exit /b 1
)

findstr /i "eventease.bmsce" "%windir%\System32\drivers\etc\hosts" >nul
if %errorlevel% equ 0 (
    echo eventease.bmsce is already mapped in your hosts file!
) else (
    echo.>>"%windir%\System32\drivers\etc\hosts"
    echo 127.0.0.1 eventease.bmsce>>"%windir%\System32\drivers\etc\hosts"
    echo Successfully added eventease.bmsce to hosts file!
)

ipconfig /flushdns >nul
echo DNS cache flushed.
echo You can now access the app at: http://eventease.bmsce:5173
pause
