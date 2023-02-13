import { application } from "express";

const { Client } = require('pg');

const DB_conf = require('@/conf/db_access.json');

interface db
{
    rows: any;
}

export async function read_all(tableName: string) {

	try {
		const client = new Client(DB_conf);
		var t = await client.connect()
			.then(() => client.query(`SELECT * from ${tableName}`))
			.then((res) => res.rows)
			.finally((res) => { client.end(); return res });
		return Promise.resolve(t);
	} catch (err) {
		console.error("ERROR DETECTED");
		return Promise.reject(err);
	}
}

export async function delete_all(tableName: string) {
	try {
		const client = new Client(DB_conf);
		var t = await client.connect()
			.then(() => client.query(`TRUNCATE ${tableName}`))
			.then((res) => res.rows)
			.finally((res) => { client.end(); return res });
		return Promise.resolve(t);
	} catch (err) {
		console.error("ERROR DETECTED");
		return Promise.reject(err);
	}
}

type ETableNames = "t_musicshortcut" ;

const update_seed: { [tname in ETableNames]: (rows: { [id: number]: object }) => Promise<any>; } = {
	"t_musicshortcut": update_musicshortcut,
};

export async function update(tname: ETableNames, rows: { [id: number]: object }): Promise<any> {
	return update_seed[tname](rows);
}

export async function read_musicshortcutFromId(id: number): Promise<{id: number, sortkey: number, fullpath: string}> {

	try {
		const client = new Client(DB_conf);
		var t = await client.connect()
			.then(() => client.query(`SELECT * from t_musicshortcut WHERE id = ${id}`))
			.then((res) => res.rows)
			.finally((res) => { client.end(); return res });
		return Promise.resolve(t);
	} catch (err) {
		console.error("ERROR DETECTED");
		return Promise.reject(err);
	}
}

function BuildValuesSql_musicshortcut(data: { [id: number]: { sorkey: number, fullname: string }; }): string {
	const return_val = Object.keys(data).map(key => {
		let v = data[key];
		return `(${key},${v.sortkey},'${v.fullpath}')`;
	}).join(',');
	console.log(return_val);
	return return_val;
}

async function update_musicshortcut(data: { [id: number]: { sorkey: number, fullname: string } }): Promise<any> {
	const tname = 't_musicshortcut';

	console.log("-------SAVE-------");
	console.log(data);

	try {
		await delete_all(tname);

		const client = new Client(DB_conf);
		await client.connect()
			.then(() => client.query(`INSERT INTO ${tname} (id, sortkey, fullpath) VALUES ${BuildValuesSql_musicshortcut(data)}`))
			.then((res) => console.log(res))
			.catch(err => console.error(err))
			.finally(() => client.end());
	} catch (err) {
		console.error("ERROR DETECTED");
		console.error(err);
	}
}

async function main() {
	console.log(await read_musicshortcutFromId(9));
}

main();

