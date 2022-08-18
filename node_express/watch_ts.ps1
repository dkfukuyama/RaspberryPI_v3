chokidar "*.ts" | ? {$_ -match "^change:"} | % {$_.Trim("change:");} | % { tsc $_; Write-Host "tsc $_"}

