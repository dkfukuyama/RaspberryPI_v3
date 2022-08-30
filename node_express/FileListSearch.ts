import path = require('path')
import fs = require('fs');

export interface FileInfo {
    BaseName: string;
    Ext: string;
    Name: string;
    ParentFullName: string;
    FullName: string;
    CreationTime: Date;
    Type: "File" | "Directory" | "NotDetected";
}

export interface FileListSearchResults {
    FileList: FileInfo[];
    DirList: FileInfo[];
}

export class FileListSearch {
    private DirBaseFullPath: string;  // �t�@�C���T���̋N�_�ƂȂ�p�X
    private DirNow: FileInfo | null = null; // ���ݒT�����Ă���f�B���N�g���̃p�X(DirBaseFullPath�N�_�̑��΃p�X)
    private FileNow: FileInfo | null = null; // ���ݒT�����Ă���t�@�C���̃p�X(DirBaseFullPath�N�_�̑��΃p�X)

    constructor(baseDir: string | null = null) {
        const path_to_resolve: string = baseDir ?? __dirname;
        this.DirBaseFullPath = path.resolve(path_to_resolve);
        this.FileNow = this.GetInfo(this.DirBaseFullPath);
    }

    GetDirBaseFullPath = (): string => this.DirBaseFullPath;
    GetDirNow = (): FileInfo => this.DirNow;

    GetList(getpath: string = ""): FileListSearchResults {
        let ret_val: FileListSearchResults = {
            FileList : [],
            DirList : [],
        }

        fs.readdirSync(this.DirNow.FullName).sort((a, b) => (a < b) ? -1 : (a > b) ? 1 : 0)
            .map(file => path.join(this.DirNow.FullName, file)).forEach((fullname) => {
                let info: FileInfo = FileListSearch.GetInfo_sub(fullname);
                if (info.Type == 'File') ret_val.FileList.push(info);
                else if (info.Type == 'Directory') ret_val.DirList.push(info);
        });
        return ret_val;
    }

    static GetInfo_sub(inp_fullpath: string): FileInfo {

        let stat = fs.statSync(inp_fullpath);
        let ps = path.parse(inp_fullpath);

        return {
            BaseName: ps.base,
            FullName: inp_fullpath,
            ParentFullName: ps.dir,
            CreationTime: stat.ctime,
            Ext: ps.ext,
            Name: ps.name,
            Type: stat.isDirectory() ? 'Directory' : stat.isFile() ? 'File' : 'NotDetected',
        }
    }


    GetInfo(inp_path: string): FileInfo {
        let tempFullName: string = inp_path;
        if (this.DirNow == null) {
            tempFullName = path.resolve(inp_path);
        } else {
            if (path.isAbsolute(inp_path)) {
                tempFullName = inp_path;
            } else {
                tempFullName = path.resolve(path.join(this.DirNow.FullName, inp_path));
            }
        }

        this.FileNow = FileListSearch.GetInfo_sub(tempFullName);

        if (this.FileNow.Type == 'Directory') {
            this.DirNow = this.FileNow;
        } else if (this.FileNow.Type == 'File') {
            this.DirNow = FileListSearch.GetInfo_sub(this.FileNow.ParentFullName);
        } else {
            throw new Error('Type must not be NotDetected!!');
        }
        return this.FileNow;
    }
}



