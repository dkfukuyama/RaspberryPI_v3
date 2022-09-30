chokidar "**/*.ts" | ? {$_ -match "^change:"} | % {$_.Trim("change:");} | % { tsc --build }

