# Import Bot Token from clipboard or secrets/bot.token into .env and Railway
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tokenFile = Join-Path $root "secrets\bot.token"
$envFile = Join-Path $root ".env"

function Test-DiscordBotToken([string]$t) {
  return $t -match '^MT[\w\-_.]{20,}$'
}

$token = $null
if (Test-Path $tokenFile) {
  $token = (Get-Content $tokenFile -Raw).Trim()
}
if (-not (Test-DiscordBotToken $token)) {
  try {
    $clip = (Get-Clipboard -Raw).Trim()
    if (Test-DiscordBotToken $clip) {
      $token = $clip
      Set-Content -Path $tokenFile -Value $token -NoNewline -Encoding ascii
      Write-Host "Saved Bot Token from clipboard to secrets/bot.token"
    }
  } catch { }
}

if (-not (Test-DiscordBotToken $token)) {
  Write-Host "Bot Token not found." -ForegroundColor Yellow
  Write-Host "Discord Portal > tok > Bot > Reset Token"
  Write-Host "Copy token, then run: pnpm setup:token"
  exit 1
}

$content = Get-Content $envFile -Raw
if ($content -match '(?m)^DISCORD_BOT_TOKEN=.*') {
  $content = $content -replace '(?m)^DISCORD_BOT_TOKEN=.*', "DISCORD_BOT_TOKEN=$token"
} else {
  $content = "DISCORD_BOT_TOKEN=$token`n" + $content
}
Set-Content -Path $envFile -Value $content.TrimEnd() -Encoding utf8
Write-Host ".env updated with DISCORD_BOT_TOKEN"

& (Join-Path $root "scripts\sync-railway-env.ps1")
