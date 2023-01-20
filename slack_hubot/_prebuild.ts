console.log('Pre Build START!')
import { InitEnv } from '../node_express/UtilFunctions';
import { execSync } from 'child_process';
import fs = require('fs');

InitEnv();

if (process.argv[2] == "CLEAN") {
	let files = fs.readdirSync(__dirname).filter(file => file.match(/(\.js$|\.js\.map$)/)).forEach(file => fs.unlinkSync(file));
	let command: string = 'tsc --build --clean';
	let sp = execSync(command);
	console.log(command);
	console.log(sp.toString());
} else {
	let command: string = 'tsc --build';
	let sp = execSync(command);
	console.log(command);
	console.log(sp.toString());
}

