require('dotenv').config({ path: '.env' });
import { FileListSearch } from '@/FileListSearch';
import { AppConf, slk } from '@/AppConf';
import path from 'path';

function test() {
	console.log([AppConf().saveDir0, AppConf().httpDir_music]);
	const f = new FileListSearch(AppConf().saveDir0, AppConf().httpDir_music);
	f.GetInfo(AppConf().music_shortcut_dir);
	console.log(f.GetList().FileList[0]);
}


test();
