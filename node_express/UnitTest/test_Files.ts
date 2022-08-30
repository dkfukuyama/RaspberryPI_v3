import assert = require('assert');
import path = require('path');

import { FileListSearch, FileListSearchResults } from '@/FileListSearch';
import { globalVars } from '../variables';

describe("FileListSearch", () => {
    it("get_path_01", () => {
        console.debug("--------------------- get_path_01");
        let FSearch: FileListSearch = new FileListSearch(globalVars().saveDir0);
        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));

        console.log(FSearch.GetDirBaseFullPath());

        const results = FSearch.GetDirNow();
        assert.equal(results.BaseName, 'node_express');
        assert.equal(results.FullName, FSearch.GetDirBaseFullPath());
        assert.equal(results.Ext, '');
        assert.equal(results.Name, 'node_express');
        assert.equal(results.Type, 'Directory');

    });

    it("get_path_02", () => {
        console.debug("--------------------- get_path_02");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');

        console.log(FSearch.GetDirBaseFullPath());

        const results = FSearch.GetDirNow();

        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));
        assert.equal(results.BaseName, 'test_mp3');
        assert.equal(results.FullName, path.join(FSearch.GetDirBaseFullPath(), 'test_mp3'));
        assert.equal(results.Ext, '');
        assert.equal(results.Name, 'test_mp3');
        assert.equal(results.Type, 'Directory');
    });

    it("get_path_03", () => {
        console.debug("--------------------- get_path_03");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');
        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));

        const results = FSearch.GetInfo("file_example_MP3_1.mp3");
        assert.equal(results.FullName, path.join(FSearch.GetDirBaseFullPath(), 'test_mp3/file_example_MP3_1.mp3'));
        assert.equal(results.BaseName, 'file_example_MP3_1.mp3');
        assert.equal(results.Ext, '.mp3');
        assert.equal(results.Name, 'file_example_MP3_1');
        assert.equal(results.Type, 'File');
    });

    it("get_path_04", () => {
        console.debug("--------------------- get_path_04");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');
        assert.equal(FSearch.GetDirBaseFullPath(),
            path.resolve(path.join(__dirname, "..")));

        let results: FileListSearchResults = FSearch.GetList();
        assert.equal(results.FileList.length, 2);
        assert.equal(results.FileList[0].BaseName, 'file_example_MP3_1.mp3');
        assert.equal(results.FileList[1].BaseName, 'file_example_MP3_2.mp3');
        assert.equal(results.DirList.length, 2);
        assert.equal(results.DirList[0].BaseName, 'g_dlfile');
        assert.equal(results.DirList[1].BaseName, 'stream');
    });

    it("get_path_05", () => {
        console.debug("--------------------- get_path_05");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');
        FSearch.GetInfo("stream");

        let results: FileListSearchResults = FSearch.GetList();
        assert.equal(results.FileList.length, 4);
        assert.equal(results.FileList[0].BaseName, '1.mp3');
        assert.equal(results.FileList[1].BaseName, '2.mp3');
        assert.equal(results.FileList[2].BaseName, 'file_example_MP3_1.mp3');
        assert.equal(results.FileList[3].BaseName, 'file_example_MP3_2.mp3');
        assert.equal(results.DirList.length, 0);
    });

    it("get_path_06", () => {
        console.debug("--------------------- get_path_06");
        let FSearch: FileListSearch = new FileListSearch('test_mp3');
        let results: FileListSearchResults;

        FSearch.GetInfo("stream");
        results = FSearch.GetList();
        assert.equal(results.FileList.length, 4);
        assert.equal(results.FileList[0].BaseName, '1.mp3');
        assert.equal(results.FileList[1].BaseName, '2.mp3');
        assert.equal(results.FileList[2].BaseName, 'file_example_MP3_1.mp3');
        assert.equal(results.FileList[3].BaseName, 'file_example_MP3_2.mp3');
        assert.equal(results.DirList.length, 0);

        FSearch.GetInfo("../");

        results = FSearch.GetList();
        assert.equal(results.FileList.length, 2);
        assert.equal(results.FileList[0].BaseName, 'file_example_MP3_1.mp3');
        assert.equal(results.FileList[1].BaseName, 'file_example_MP3_2.mp3');
        assert.equal(results.DirList.length, 2);
        assert.equal(results.DirList[0].BaseName, 'g_dlfile');
        assert.equal(results.DirList[1].BaseName, 'stream');
    });


});
