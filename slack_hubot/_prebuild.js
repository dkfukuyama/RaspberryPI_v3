"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Pre Build START!');
const UtilFunctions_1 = require("../node_express/UtilFunctions");
const child_process_1 = require("child_process");
const fs = require("fs");
(0, UtilFunctions_1.InitEnv)();
if (process.argv[2] == "CLEAN") {
    let files = fs.readdirSync(__dirname).filter(file => file.match(/(\.js$|\.js\.map$)/)).forEach(file => fs.unlinkSync(file));
    let command = 'tsc --build --clean';
    let sp = (0, child_process_1.execSync)(command);
    console.log(command);
    console.log(sp.toString());
}
else {
    let command = 'tsc --build';
    let sp = (0, child_process_1.execSync)(command);
    console.log(command);
    console.log(sp.toString());
}
//# sourceMappingURL=_prebuild.js.map