#!/usr/bin/env pwsh

# Tail Netlify Functions logs with color-coded output
# Usage: .\tail-fns.ps1

Write-Host "🐝 Tailing Netlify Functions logs..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

$env:FORCE_COLOR = "1"

# Start background jobs for each function
$job1 = Start-Job -ScriptBlock {
    netlify functions:log github-webhook 2>&1 | ForEach-Object {
        Write-Output "[github-webhook] $_"
    }
}

$job2 = Start-Job -ScriptBlock {
    netlify functions:log webhook-telemetry 2>&1 | ForEach-Object {
        Write-Output "[webhook-telemetry] $_"
    }
}

# Monitor jobs and display output
try {
    while ($true) {
        # Get output from job 1
        $output1 = Receive-Job -Job $job1 -ErrorAction SilentlyContinue
        if ($output1) {
            $output1 | ForEach-Object {
                Write-Host $_ -ForegroundColor Green
            }
        }

        # Get output from job 2
        $output2 = Receive-Job -Job $job2 -ErrorAction SilentlyContinue
        if ($output2) {
            $output2 | ForEach-Object {
                Write-Host $_ -ForegroundColor Magenta
            }
        }

        Start-Sleep -Milliseconds 100

        # Check if jobs are still running
        if ($job1.State -ne "Running" -and $job2.State -ne "Running") {
            break
        }
    }
}
finally {
    # Cleanup
    Stop-Job -Job $job1, $job2 -ErrorAction SilentlyContinue
    Remove-Job -Job $job1, $job2 -ErrorAction SilentlyContinue
    Write-Host "`n✅ Stopped tailing logs" -ForegroundColor Cyan
}
