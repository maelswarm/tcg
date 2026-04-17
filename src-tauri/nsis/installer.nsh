; Custom NSIS installer script for TCG Price Tracker
; Handles graceful upgrades, removal of old versions, and PostgreSQL setup
!include LogicLib.nsh

!macro preInstall
  ; Kill any running instances of the app and associated processes before installation
  ; Use /T (tree) flag to kill process and all children
  ; This ensures server-sidecar and any spawned node processes are all terminated
  nsExec::ExecToLog "taskkill /F /T /IM server-sidecar.exe"
  Sleep 500
  nsExec::ExecToLog "taskkill /F /IM tcg-price-tracker.exe"
  Sleep 1000
!macroend

!macro postInstall
  ; ── PostgreSQL Detection ─────────────────────────────────────────
  DetailPrint "Checking for PostgreSQL..."
  nsExec::ExecToStack 'powershell.exe -NoProfile -Command "if ((Get-Command psql -ErrorAction SilentlyContinue) -or (Test-Path \"$env:PROGRAMFILES\PostgreSQL\")) { exit 0 } else { exit 1 }"'
  Pop $0  ; exit code (0 = found, 1 = not found)

  ${If} $0 != 0
    ; ── Not installed: try winget first ──────────────────────────
    DetailPrint "PostgreSQL not found. Installing via winget..."
    nsExec::ExecToStack 'powershell.exe -NoProfile -Command "winget install --id PostgreSQL.PostgreSQL.16 --silent --accept-package-agreements --accept-source-agreements --override \"--unattendedmodeui minimal --mode unattended --superpassword albinoblacksheep1234321 --serverport 5432 --install_runtimes 0\" 2>&1; exit $LASTEXITCODE"'
    Pop $1

    ${If} $1 != 0
      ; ── winget failed: direct download fallback ──────────────
      DetailPrint "winget unavailable. Downloading PostgreSQL installer..."
      nsExec::ExecToLog 'powershell.exe -NoProfile -Command "$i=\"$env:TEMP\pg16.exe\"; Invoke-WebRequest -Uri \"https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64.exe\" -OutFile $i; Start-Process $i -ArgumentList \"--unattendedmodeui minimal --mode unattended --superpassword albinoblacksheep1234321 --serverport 5432 --install_runtimes 0\" -Wait; Remove-Item $i"'
    ${EndIf}

    ; ── Wait for PG service to start ─────────────────────────────
    DetailPrint "Waiting for PostgreSQL service..."
    Sleep 8000
    nsExec::ExecToLog 'powershell.exe -NoProfile -Command "Start-Service postgresql* -ErrorAction SilentlyContinue"'
    Sleep 3000
  ${Else}
    DetailPrint "PostgreSQL already installed. Skipping installation."
  ${EndIf}
!macroend
