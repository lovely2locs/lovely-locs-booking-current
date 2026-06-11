$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

$bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$node = if (Test-Path -LiteralPath $bundledNode) { $bundledNode } else { "node" }

Write-Host "Lovely Locs live update prep"
Write-Host "1. Running website QA tests..."
& $node "qa-test.js"
if ($LASTEXITCODE -ne 0) {
  throw "QA tests failed. Fix the issue before uploading to GitHub."
}

Write-Host "2. Rebuilding deploy ZIP..."
$zip = Join-Path $root "lovely-locs-booking-deploy.zip"
if (Test-Path -LiteralPath $zip) {
  Remove-Item -LiteralPath $zip
}

$files = @(
  "index.html",
  "styles.css",
  "script.js",
  "local-server.js",
  "package.json",
  "render.yaml",
  "DEPLOYMENT.md",
  "confirmation-backend.md",
  "FINISH_DEPLOYMENT_STEPS.md",
  "AUTOMATION_SETUP.md",
  "lovely-locs-recommended-products.md",
  ".env.example",
  "VERSION_HISTORY.md",
  "payment-platform-plan.md",
  "qa-test.js",
  "OPEN_WEBSITE.bat",
  "PREPARE_LIVE_UPDATE.bat",
  "prepare-live-update.ps1",
  "DEPLOY_LIVE_UPDATE.bat",
  "deploy-live-update.ps1"
)

if (Test-Path -LiteralPath (Join-Path $root "assets")) {
  Get-ChildItem -LiteralPath (Join-Path $root "assets") -Recurse -File | ForEach-Object {
    $files += $_.FullName.Substring($root.Length + 1)
  }
}

$existingFiles = $files | Where-Object { Test-Path -LiteralPath (Join-Path $root $_) }
Compress-Archive -LiteralPath $existingFiles -DestinationPath $zip

$uploadFolder = "C:\Users\Administrator\Documents\Codex\UPLOAD_THIS_TO_GITHUB_LOVELY_LOCS_BOOKING"
if (Test-Path -LiteralPath $uploadFolder) {
  Write-Host "3. Refreshing GitHub upload folder..."
  foreach ($file in $existingFiles) {
    $destination = Join-Path $uploadFolder $file
    $destinationDirectory = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $destinationDirectory)) {
      New-Item -ItemType Directory -Path $destinationDirectory | Out-Null
    }
    Copy-Item -LiteralPath (Join-Path $root $file) -Destination $destination -Force
  }
}

Write-Host ""
Write-Host "Ready for live update."
Write-Host "Deploy ZIP: $zip"
if (Test-Path -LiteralPath $uploadFolder) {
  Write-Host "Upload folder: $uploadFolder"
}
Write-Host ""
Write-Host "Next: upload/commit these files to GitHub. Render will redeploy from the connected repo."
