import path = require('path')
import fs = require('fs');


type EType =  "File" | "Directory" | "NotDetected";
export interface FileInfo {
    BaseName: string;
    Ext: string;
    Name: string;
    ParentFullName: string;
    Url: string;
    FullName: string;
    CreationTime: Date;
    Type: EType;
}

export interface FileListSearchResults {
    FileList: FileInfo[];
    DirList: FileInfo[];
    ErrorFlag: boolean;
}

export class FileListSearch {
    private InitializeOK: boolean = false;
    private DirBaseFullPath: string;  // �t�@�C���T���̋N�_�ƂȂ�p�X
    private DirNow: FileInfo | null = null; // ���ݒT�����Ă���f�B���N�g���̃p�X(DirBaseFullPath�N�_�̑��΃p�X)
    private FileNow: FileInfo | null = null; // ���ݒT�����Ă���t�@�C���̃p�X(DirBaseFullPath�N�_�̑��΃p�X)
    private RootUrl: string = "";

    constructor(baseDir: string | null = null, rootUrl?: string) {
        const path_to_resolve: string = baseDir ?? __dirname;
        try {
            this.InitializeOK = true;

            this.RootUrl = rootUrl ?? "";
            this.DirBaseFullPath = path.resolve(path_to_resolve);
            this.FileNow = this.GetInfo(this.DirBaseFullPath);
        } catch (err){
            console.error(err);
            this.InitializeOK = false;
        }
    }

    GetDirBaseFullPath = (): string => this.DirBaseFullPath;
    GetDirNow = (): FileInfo => this.DirNow;

    GetList(getpath: string = ""): FileListSearchResults {

        let ret_val: FileListSearchResults = {
            FileList: [],
            DirList: [],
            ErrorFlag: true,
        }
        try {
            if (this.InitializeOK) {
                fs.readdirSync(this.DirNow.FullName).sort((a, b) => (a < b) ? -1 : (a > b) ? 1 : 0)
                    .map(file => path.join(this.DirNow.FullName, file)).forEach((fullname) => {
                        let info: FileInfo = FileListSearch.GetInfo_sub(fullname);
                        if (info.Type == 'File') ret_val.FileList.push(info);
                        else if (info.Type == 'Directory') ret_val.DirList.push(info);
                    });
                ret_val.ErrorFlag = false;
            }
        } catch (err) {
            console.error(err);
            ret_val.ErrorFlag = true;
            this.InitializeOK = false;
        }
        return ret_val;
    }

    static GetInfo_sub(inp_fullpath: string, base_fullpath?: string, rootUrl?: string): FileInfo {

        let stat = fs.statSync(inp_fullpath);
        let ps = path.parse(inp_fullpath);

        let tp: EType = stat.isDirectory() ? 'Directory' : stat.isFile() ? 'File' : 'NotDetected';
        let url: string = "";
        if (base_fullpath) {
            url = path.relative(base_fullpath, inp_fullpath);
            if (rootUrl) url = `${rootUrl}/${url}`;
        }

        return {
            BaseName: ps.base,
            FullName: inp_fullpath,
            ParentFullName: ps.dir,
            CreationTime: stat.ctime,
            Url: url,
            Ext: ps.ext,
            Name: ps.name,
            Type: tp
        }
    }


    GetInfo(inp_path: string): FileInfo {
        try {
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

            this.FileNow = FileListSearch.GetInfo_sub(tempFullName, this.DirBaseFullPath, this.RootUrl);

            if (this.FileNow.Type == 'Directory') {
                this.DirNow = this.FileNow;
            } else if (this.FileNow.Type == 'File') {
                this.DirNow = FileListSearch.GetInfo_sub(this.FileNow.ParentFullName);
            } else {
                throw new Error('Type must not be NotDetected!!');
            }
        } catch (err) {
            console.error(err);
            this.InitializeOK = false;
        }
        return this.FileNow;
    }
}



