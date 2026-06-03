# Pull Railway variables into local .env
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envPath = Join-Path $root ".env"
$serviceId = "12b8d33e-3d7f-448c-b170-dacca55c4fc2"
$tokenFile = Join-Path $root "secrets\bot.token"

Push-Location $root
try {
  $json = railway variable list -s $serviceId --json | ConvertFrom-Json
  $botToken = $json.DISCORD_BOT_TOKEN
  if (-not $botToken -and (Test-Path $tokenFile)) {
    $botToken = (Get-Content $tokenFile -Raw).Trim()
  }
  $guildId = $json.DISCORD_GUILD_ID
  if (-not $guildId) { $guildId = "" }

  $lines = @(
    "DISCORD_BOT_TOKEN=$botToken",
    "DISCORD_CLIENT_ID=$($json.DISCORD_CLIENT_ID)",
    "DISCORD_CLIENT_SECRET=",
    "DISCORD_GUILD_ID=$guildId",
    "DATABASE_URL=$($json.DATABASE_URL)",
    "REDIS_URL=",
    "NODE_ENV=development",
    "PORT=3000"
  )
  Set-Content -Path $envPath -Value ($lines -join "`n") -Encoding utf8
  Write-Host ".env updated from Railway"
}
finally {
  Pop-Location
}
