import assert = require('assert');
import { FileListSearch } from '../get_musicList';

describe("FileListSearch", () => {
    it("get_path_01", () => {
        let FSearch: FileListSearch = new FileListSearch();
        assert(FSearch.GetDirBaseFullPath(), __dirname);
    });

    it("get_path_02", () => {
        let FSearch: FileListSearch = new FileListSearch();
        console.log(FSearch.GetDirNow());
    });

});
