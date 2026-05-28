@echo off
set "ROOT=%~dp0"
set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
start "Lovely Locs Server" /min "%NODE%" "%ROOT%local-server.js"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4175/"
