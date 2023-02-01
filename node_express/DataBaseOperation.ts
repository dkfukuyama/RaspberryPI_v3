import { application } from "express";

const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    password: 'is_2488',
    host: '192.168.1.231',   // 詳細は後述
    database: 'postgres',
    port: 5432,
});

client.connect();


interface db
{
    rows: any;
}

async function main(){
	const res: db = await client.query('SELECT * from t_musicshortcut');
	console.log(res.rows) // Hello world!
	await client.end()
}

main();


