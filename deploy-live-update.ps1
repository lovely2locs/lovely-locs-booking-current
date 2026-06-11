$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

$repo = if ($env:GITHUB_REPO) { $env:GITHUB_REPO } else { "lovely2locs/lovely-locs-booking" }
$branch = if ($env:GITHUB_BRANCH) { $env:GITHUB_BRANCH } else { "main" }
$renderServiceId = if ($env:RENDER_SERVICE_ID) { $env:RENDER_SERVICE_ID } else { "srv-d8b3dc8jo6nc73cdi2bg" }
$publicSiteUrl = if ($env:PUBLIC_SITE_URL) { $env:PUBLIC_SITE_URL.TrimEnd("/") } else { "https://lovely-locs-booking.onrender.com" }

function ConvertFrom-SecureStringPlainText {
  param([Security.SecureString]$Secure)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Get-SecretValue {
  param(
    [string]$EnvironmentName,
    [string]$Prompt,
    [switch]$Optional
  )

  $existing = [Environment]::GetEnvironmentVariable($EnvironmentName)
  if ($existing) { return $existing }

  if ($Optional) {
    if (-not [Environment]::UserInteractive) { return "" }
    $plain = Read-Host "$Prompt (press Enter to skip)"
    if (-not $plain) { return "" }
    return $plain
  }

  $secure = Read-Host $Prompt -AsSecureString
  $value = ConvertFrom-SecureStringPlainText -Secure $secure
  if (-not $value) { throw "$EnvironmentName is required." }
  return $value
}

function Get-GitHubContentPath {
  param([string]$RelativePath)
  (($RelativePath -replace "\\", "/").Split("/") | ForEach-Object {
    [uri]::EscapeDataString($_)
  }) -join "/"
}

function Invoke-GitHubJson {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers,
    [object]$Body = $null
  )

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
  }

  $json = $Body | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -Body $json -ContentType "application/json"
}

$githubToken = Get-SecretValue -EnvironmentName "GITHUB_TOKEN" -Prompt "Paste temporary GitHub token"
$renderToken = Get-SecretValue -EnvironmentName "RENDER_API_KEY" -Prompt "Paste temporary Render API key" -Optional

Write-Host "Lovely Locs live deploy"
Write-Host "Repo: $repo"
Write-Host "Branch: $branch"
Write-Host ""

Write-Host "1. Preparing update package..."
& (Join-Path $root "prepare-live-update.ps1")
if ($LASTEXITCODE -ne 0) {
  throw "Update prep failed."
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
    $relative = $_.FullName.Substring($root.Length + 1)
    $files += $relative
  }
}

$files = $files | Where-Object { Test-Path -LiteralPath (Join-Path $root $_) } | Sort-Object -Unique

$githubHeaders = @{
  Authorization = "Bearer $githubToken"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
  "User-Agent" = "Lovely-Locs-Deploy"
}

Write-Host "2. Uploading files to GitHub..."
$commitMessage = "Update Lovely Locs site $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$uploaded = 0

foreach ($file in $files) {
  $fullPath = Join-Path $root $file
  $apiPath = Get-GitHubContentPath -RelativePath $file
  $contentUrl = "https://api.github.com/repos/$repo/contents/$apiPath"
  $sha = $null

  try {
    $existing = Invoke-GitHubJson -Method "GET" -Uri "$contentUrl`?ref=$branch" -Headers $githubHeaders
    $sha = $existing.sha
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
  }

  $bytes = [IO.File]::ReadAllBytes($fullPath)
  $body = @{
    message = $commitMessage
    content = [Convert]::ToBase64String($bytes)
    branch = $branch
  }
  if ($sha) { $body.sha = $sha }

  Invoke-GitHubJson -Method "PUT" -Uri $contentUrl -Headers $githubHeaders -Body $body | Out-Null
  $uploaded += 1
  Write-Host "   uploaded $file"
}

Write-Host "3. GitHub update complete: $uploaded files uploaded."

if ($renderToken) {
  Write-Host "4. Triggering Render deploy..."
  $renderHeaders = @{
    Authorization = "Bearer $renderToken"
    Accept = "application/json"
    "Content-Type" = "application/json"
  }
  $renderBody = @{ clearCache = "clear" } | ConvertTo-Json
  $deploy = Invoke-RestMethod -Method "POST" -Uri "https://api.render.com/v1/services/$renderServiceId/deploys" -Headers $renderHeaders -Body $renderBody
  Write-Host "Render deploy requested: $($deploy.id)"
} else {
  Write-Host "4. Render key skipped. Render should still auto-deploy if GitHub auto-deploy is enabled."
}

Write-Host "5. Checking live website..."
try {
  $health = Invoke-WebRequest -Uri "$publicSiteUrl/healthz" -UseBasicParsing -TimeoutSec 30
  Write-Host "Live health check: $($health.StatusCode) $($health.Content)"
} catch {
  Write-Host "Live health check could not be confirmed yet. Render may still be deploying."
  Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Live update submitted."
Write-Host "Website: $publicSiteUrl"
