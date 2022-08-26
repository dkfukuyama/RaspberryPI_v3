import assert = require('assert');
import { FileListSearch } from '@/get_musicList';
import path = require('path');

describe("FileListSearch", () => {
    it("get_path_01", () => {
        console.debug("--------------------- get_path_01");
        console.debug({ __dirname });
        let FSearch: FileListSearch = new FileListSearch();
        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));
    });

    it("get_path_02", () => {
        console.debug("--------------------- get_path_02");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');

        const results = FSearch.GetDirNow();
        assert.equal(results.BaseName, 'test_mp3');
        assert.equal(results.Name, 'test_mp3');
        assert.equal(results.Type, 'Directory');
    });
});
