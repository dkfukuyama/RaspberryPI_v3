import assert = require('assert');
import { FileListSearch } from '@/get_musicList';
import path = require('path');

describe("FileListSearch", () => {
    it("get_path_01", () => {
        console.debug("--------------------- get_path_01");
        let FSearch: FileListSearch = new FileListSearch();
        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));

        const results = FSearch.GetDirNow();
        assert.equal(results.BaseName, 'node_express');
        assert.equal(results.Ext, '');
        assert.equal(results.Name, 'node_express');
        assert.equal(results.Type, 'Directory');

    });

    it("get_path_02", () => {
        console.debug("--------------------- get_path_02");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');

        const results = FSearch.GetDirNow();
        assert.equal(results.BaseName, 'test_mp3');
        assert.equal(results.Ext, '');
        assert.equal(results.Name, 'test_mp3');
        assert.equal(results.Type, 'Directory');
    });

    it("get_path_03", () => {
        console.debug("--------------------- get_path_03");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');
        const results = FSearch.GetInfo("file_example_MP3_700KB.mp3");
        assert.equal(results.BaseName, 'file_example_MP3_700KB');
        assert.equal(results.Ext, 'mp3');
        assert.equal(results.Name, 'file_example_MP3_700KB.mp3');
        assert.equal(results.Type, 'File');
    });
});
