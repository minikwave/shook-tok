# Sync local .env to Railway (requires DISCORD_BOT_TOKEN in .env or secrets/bot.token)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"
$tokenFile = Join-Path $root "secrets\bot.token"
$serviceId = "12b8d33e-3d7f-448c-b170-dacca55c4fc2"

if (-not (Test-Path $envFile)) {
  Write-Error ".env not found"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^\s*([^=]+)=(.*)$') { return }
  $key = $Matches[1].Trim()
  $val = $Matches[2].Trim().Trim('"').Trim("'")
  if ($val) { Set-Item -Path "env:$key" -Value $val }
}

if (-not $env:DISCORD_BOT_TOKEN -and (Test-Path $tokenFile)) {
  $env:DISCORD_BOT_TOKEN = (Get-Content $tokenFile -Raw).Trim()
}

$required = @("DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID", "DATABASE_URL")
$missing = $required | Where-Object { -not (Get-Item "env:$_" -ErrorAction SilentlyContinue) }
if ($missing.Count -gt 0) {
  Write-Error ("Missing: " + ($missing -join ", "))
}

Push-Location $root
try {
  $args = @(
    "DISCORD_BOT_TOKEN=$env:DISCORD_BOT_TOKEN",
    "DISCORD_CLIENT_ID=$env:DISCORD_CLIENT_ID",
    "DATABASE_URL=$env:DATABASE_URL",
    "NODE_ENV=production"
  )
  if ($env:DISCORD_GUILD_ID) {
    $args += "DISCORD_GUILD_ID=$env:DISCORD_GUILD_ID"
  }
  railway variable set @args -s $serviceId
  Write-Host "Railway variables synced. Redeploying..."
  railway up --detach -s $serviceId
}
finally {
  Pop-Location
}
