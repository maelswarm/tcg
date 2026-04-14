; Custom NSIS installer script for TCG Price Tracker
; Handles graceful upgrades and removal of old versions

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
  ; No additional post-install tasks needed
!macroend
