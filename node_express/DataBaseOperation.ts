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
			.then((res) => {
				client.end();
				return res.rows;
			})
		return Promise.resolve(t);
	} catch (err) {
		console.error("ERROR DETECTED");
		return Promise.reject(err);
	}
}

type ETableNames = "t_musicshortcut" ;

const update_seed: { [tname in ETableNames]: (rows: object[]) => Promise<any>; } = {
	"t_musicshortcut": insert_musicshortcut,
};

export async function update(tname: ETableNames, rows: object[]): Promise<any> {
	return update_seed[tname](rows);
}

async function insert_musicshortcut(rows : { sortkey: number, fullpath: string }[]) {
	try {
		const client = new Client(DB_conf);
		await client.connect()
			.then(() => client.query("SELECT max(id) from t_musicshortcut"))
			.then((res) => res.rows[0].max)
			.then((row_num) => client.query("INSERT INTO t_musicshortcut (id, sortkey, fullpath) VALUES ($1, $2, $3)", [(row_num + 1), sortkey, fullpath]))
			.then((res) => console.log(res))
			.then(() => client.end());
	} catch (err) {
		console.error("ERROR DETECTED");
		console.error(err);
	}
	return Promise.resolve();
}

async function main() {
	await read_all('t_musicshortcut');
}

main();
