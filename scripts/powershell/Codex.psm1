function Invoke-CodexBroadcast {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateSet('pr', 'gist', 'netlify', 'discord', 'gemini')]
        [string]$Type,

        [hashtable]$Payload = @{},

        [string]$BaseUrl = 'https://beehive.netlify.app/.netlify/functions',

        [string]$Capability = $env:CODEX_CAPABILITY,

        [string]$Actor = 'Keeper Tristan'
    )

    if (-not $Capability) {
        Write-Host '❌ Missing capability env var.' -ForegroundColor Red
        return
    }

    $endpoint = switch ($Type) {
        'pr' { 'broadcast-pr' }
        'gist' { 'broadcast-gist' }
        'netlify' { 'broadcast-netlify' }
        'discord' { 'broadcast-discord' }
        'gemini' { 'gemini-generate' }
    }

    $uri = "$BaseUrl/$endpoint"
    $json = $Payload | ConvertTo-Json -Depth 6

    Write-Host "📡 $Type → $uri" -ForegroundColor Cyan

    try {
        $res = Invoke-WebRequest -Uri $uri -Method POST -Headers @{
            'x-codex-capability' = $Capability
            'x-codex-actor' = $Actor
            'Content-Type' = 'application/json'
        } -Body $json

        Write-Host "✅ Status: $($res.StatusCode)" -ForegroundColor Green
        Write-Host $res.Content
    }
    catch {
        Write-Host "❌ Broadcast failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response -and $_.Exception.Response.ContentLength -gt 0) {
            $_.Exception.Response.GetResponseStream() | % {
                $reader = New-Object System.IO.StreamReader($_)
                Write-Host ($reader.ReadToEnd())
                $reader.Dispose()
            }
        }
    }
}

Export-ModuleMember -Function Invoke-CodexBroadcast
