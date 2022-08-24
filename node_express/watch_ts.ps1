chokidar "**/*.ts" | ? {$_ -match "^change:"} | % {$_.Trim("change:");} | % { npm run build}

