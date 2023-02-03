import { application } from "express";

const { Client } = require('pg');

const DB_conf = require('@/conf/db_access.json');

interface db
{
    rows: any;
}

async function read_all() {
	try {
		const client = new Client(DB_conf);
		await client.connect()
			.then(()=>client.query('SELECT * from t_musicshortcut'))
			.then(res=>console.log(res.rows)) // Hello world!
			.then(()=>client.end());
	} catch (err) {
		console.error("ERROR DETECTED");
		console.error(err);
	}
}


async function insert(sortkey: number, fullpath: string) {
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
}


async function main() {
	await read_all();
	await insert(999, "AHOAHO");
	await read_all();
}

main();
