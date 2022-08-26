import ut = require('./utils');
import { globalVars, getLocalAddress } from './variables';
import path = require('path')
import fs = require('fs');

function get(baseDir) {
    let dir = globalVars().saveDir0;

    if (baseDir) dir = path.join(dir, baseDir);

    let files = fs.readdirSync(dir);

    let fileList = [];
    let dirList = [];
    files.forEach(function (file) {
        let temp_file = path.join(dir, file);
        let stat = fs.statSync(temp_file);

        if (stat.isDirectory()) dirList.push(file);
        else if(/.*\.(mp3|wav)$/.test(temp_file)) fileList.push(file);
    });
    return {
        fileList:fileList,
        dirList:dirList
    };
}
exports.get = get;


interface FileInfo {
    BaseName: string;
    Ext: string;
    Name: string;
    Fullname: string;
    CreationTime: Date;
    Type: "File" | "Directory" | "NotDetected";
}

interface FileListSearchResults {
    FileList: FileInfo[];
    DirList: FileInfo[];
}

export class FileListSearch {
    private DirBaseFullPath: string;
    private ExtraDirBaseFullPath: string[];
    private DirNow: FileInfo;

    constructor(baseDir: string | null = null) {
        this.DirBaseFullPath = baseDir ?? __dirname;
        this.DirNow = this.GetInfo(this.DirBaseFullPath);
    }

    GetDirBaseFullPath = (): string => this.DirBaseFullPath;
    GetDirNow = (): FileInfo => this.DirNow;

    GetList(path: string|null): FileListSearchResults {
        let ret_val: FileListSearchResults;
        return ret_val;
    }

    GetInfo(inp_path:string): FileInfo {
        let stat = fs.statSync(inp_path);
        
        console.log({ inp_path });

        let inp_path_r = path.posix.relative(this.DirBaseFullPath, inp_path);

        console.log({ inp_path_r });

        let ps = path.posix.parse(inp_path_r);
        let rs = path.posix.resolve(inp_path_r);
        return {
            BaseName: ps.base,
            Fullname: rs,
            CreationTime: stat.ctime,
            Ext: ps.ext,
            Name: ps.name,
            Type: stat.isDirectory() ? 'Directory' : stat.isFile() ? 'File' : 'NotDetected',
        }
    }
}



