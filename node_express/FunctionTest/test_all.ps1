cat ./test_env.secret -Raw | Invoke-Expression;

ls *.js | % {node $_.Name};
