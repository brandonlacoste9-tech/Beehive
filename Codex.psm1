function Invoke-CodexBroadcast {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateSet('pr', 'gist', 'netlify', 'discord')]
        [string] $Type,

        [hashtable] $Payload = @{},

        [string] $BaseUrl = 'https://your-site.netlify.app/.netlify/functions',

        [string] $Capability = $env:CODEX_CAPABILITY
    )

    if (-not $Capability) {
        Write-Host '❌ Missing capability. Set CODEX_CAPABILITY env var.' -ForegroundColor Red
        return
    }

    $endpoint = switch ($Type) {
        'pr' { 'broadcast-pr' }
        'gist' { 'broadcast-gist' }
        'netlify' { 'broadcast-netlify' }
        'discord' { 'broadcast-discord' }
    }

    $uri = "$BaseUrl/$endpoint"
    $json = ($Payload | ConvertTo-Json -Depth 6)

    Write-Host "📡 Broadcasting $Type → $uri" -ForegroundColor Cyan
    $res = Invoke-WebRequest -Uri $uri -Method POST -Headers @{ 'x-codex-capability' = $Capability; 'Content-Type' = 'application/json' } -Body $json
    Write-Host "✅ Status: $($res.StatusCode)" -ForegroundColor Green
    Write-Host $res.Content
}

function Invoke-GeminiScroll {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $Prompt,

        [string] $Model = 'gemini-2.5-flash',

        [string] $BaseUrl = 'https://your-site.netlify.app/.netlify/functions/gemini-generate',

        [string] $Capability = $env:CODEX_CAPABILITY
    )

    if (-not $Capability) {
        Write-Host '❌ Missing capability. Set CODEX_CAPABILITY env var.' -ForegroundColor Red
        return
    }

    $payload = @{ prompt = $Prompt; model = $Model } | ConvertTo-Json
    Write-Host "🔮 Summoning Gemini ($Model)" -ForegroundColor Magenta
    $res = Invoke-WebRequest -Uri $BaseUrl -Method POST -Headers @{ 'x-codex-capability' = $Capability; 'Content-Type' = 'application/json' } -Body $payload
    $obj = $res.Content | ConvertFrom-Json
    Write-Host "✅ Status: $($res.StatusCode)" -ForegroundColor Green
    if ($obj.text) {
        Write-Host '🔮 Gemini says:' -ForegroundColor Yellow
        Write-Host $obj.text -ForegroundColor Yellow
    } else {
        Write-Host $res.Content
    }
}
