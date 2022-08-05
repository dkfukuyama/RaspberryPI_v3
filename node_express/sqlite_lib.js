const res = require("express/lib/response");
const sqlite3 = require("sqlite3");


function GetResults(err){
    if(err){
        console.log("エラー： " + JSON.stringify(err));
    }
};

function GetResultsT(db, resolve, reject, continue_status){
    return (err) => {
        if(continue_status != 'open'){
            //console.log('DB CLOSE');
            db.close();
        }else{
            //console.log('DB CONTINUE');
        }
        if(err){
            reject(JSON.stringify(err));
        }
        resolve(db);
    };
}

function DisplayTable(dbpath, tablename) {
    return new Promise((resolve, reject)=>{
        const db = new sqlite3.Database(dbpath);
        db.on("error", (err)=>reject(err));

        console.log(`command: "SELECT * FROM ${tablename}"`);
        db.all(`SELECT * FROM ${tablename}`, (err, rows) => {
            if (err) {
                console.log('------');
                reject(err);
            }

            rows.forEach(row => {
                console.log(JSON.stringify(row));
            });
            db.close();
            console.log('------');
            resolve('OK');
        });
    });
}

function InitDB(dbpath){
    return new Promise((resolve, reject)=>{

        const db = new sqlite3.Database(dbpath);
        db.on("error", (err)=>reject(err));
        db.serialize(() => {

            db.run(`
            CREATE TABLE IF NOT EXISTS FamilyMembers(
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                age INTEGER NOT NULL
            )
            `,GetResults);
            /*
            var insertData = db.prepare('INSERT INTO FamilyMembers VALUES (?, ?, ?)');
            insertData.run([1, 'あああああ', 9], GetResults); 
            insertData.run([2, 'いいいいい', 7], GetResults);
            insertData.run([3, 'ううううう', 4], GetResults);
            insertData.finalize();
            */
            db.run(`
            CREATE TABLE IF NOT EXISTS Quiz(
                id INTEGER PRIMARY KEY,
                Composer_Id INTEGER NOT NULL,
                Right TEXT NOT NULL,
                Wrong1 TEXT NOT NULL,
                Wrong2 TEXT NOT NULL,
                FOREIGN KEY(Composer_Id) REFERENCES FamilyMembers(id)
            )
            `, GetResultsT(db, resolve, reject));
        });

    });
}

function GetIdFromName(dbpath, name) {
    return new Promise((resolve, reject)=>{
        const db = new sqlite3.Database(dbpath);
        db.on("error", (err)=>reject(err));

        let command = `SELECT * FROM FamilyMembers WHERE name=\"${name}\"`;
        console.log(command);
        db.get(command, (err, row) => {
            db.close();
            if (err) {
                resolve({
                    err:err,
                    results: -1
                });
            }
            resolve(
            {
                row:row,
                results: row?.id ?? -1
            });
        });
    });
}



function AddMember(memberName){ 
    db.serialize(() =>{
        db.all("select * FamilyMembers", (error, rows) =>{
            rows.forEach(row => console.log(row.name));
        })
    });
}

/*
async function AddQuiz(id, right, wrong1, wrong2){
    return new Promise((resolve, reject)=>{
        const db = new sqlite3.Database(dbpath);
        db.on("error", (err)=>reject(err));

        let command = `SELECT * FROM FamilyMembers WHERE name=\"${name}\"`;
        console.log(command);
        db.run(command, (err, row) => {
            if (err) {
                reject(err);
            }
            db.close();
            resolve(row.id);
        });
    });
}
*/

async function AddQuiz(dbpath, memberName, right, wrong1, wrong2, quizid=-1){
    var res = await GetIdFromName(dbpath, memberName);
    if(res.results == -1){
        return new Promise((resolve, reject)=>reject(res));
    }
    
    console.log(res);

    const memberId = res.results;

    return AddQuizByMemberId(dbpath, memberId, right, wrong1, wrong2, quizid);
}

function AddQuizByMemberId(dbpath, memberId, right, wrong1, wrong2, quizid=-1){
    
    // データが存在するかを確認
    if(quizid != -1){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(dbpath);
            db.on("error", (err)=>reject(err));
            
            let command = `
            UPDATE Quiz 
            SET Composer_id=${memberId},
                Right=\"${right}\",
                Wrong1=\"${wrong1}\",
                Wrong2=\"${wrong2}\"
            WHERE id=${quizid}
            `;
            console.log(command);
            db.run(command, (err, row) => {
                db.close();
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }else{
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(dbpath);
            db.on("error", (err)=>reject(err));
            
            let command = `
            INSERT INTO Quiz(id, Composer_Id, Right, Wrong1, Wrong2)
            VALUES ((SELECT MAX(id) from Quiz) + 1, ${memberId}, \"${right}\", \"${wrong1}\", \"${wrong2}\")
            `;
            console.log(command);
            db.run(command, (err, row) => {
                db.close();
                if (err) {
                    console.log("ER 184");
                    reject(err);
                }
                resolve(row);
            });
        });
    }
}


function RemoveQuiz(dbpath, removeId){
    return new Promise((resolve, reject)=>{
        const db = new sqlite3.Database(dbpath);
        db.on("error", (err)=>reject(err));
        
        let command = `
        DELETE FROM Quiz
        WHERE id=${removeId}
        `;
        console.log(command);
        db.run(command, (err, row) => {
            db.close();
            if (err) {
                console.log("ER 184");
                reject(err);
            }
            resolve(row);
        });
    });
}

function DisplayTableLog(dbpath){
    return DisplayTable(dbpath, 'LogData');
}

function InitLogDB(dbpath){
    return new Promise((resolve, reject)=>{
        const db = new sqlite3.Database(dbpath);

        db.on("error", (err)=>reject(err));
        db.serialize(() => {
            db.run(`
            CREATE TABLE IF NOT EXISTS LogData (
                logtype TEXT NOT NULL DEFAULT ('NONE'),
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
            )
            `, GetResultsT(db, resolve, reject, 'open'));
        });
    });
}


function getRowNum() {
    let e = new Error();
    e = e.stack.split("\n")[2].split(":");
    e.pop();
    return e.pop();
}

function AddLogDB(dbpath, type, str, continue_status){
    return InitLogDB(dbpath)
    .then((db)=>new Promise((resolve, reject) => {
        var insertData = db.prepare('INSERT INTO LogData VALUES (?, ?, CURRENT_TIMESTAMP)');
        insertData.run([type, str], null, GetResultsT(db, resolve, reject, continue_status)); 
        return db;
    }));
}


/*
async function main(){

    const dbpath = "./test.db";

    await InitDB(dbpath).then(res=>console.log(res)).catch((err)=>console.log(err))
    .then(()=>DisplayTable(dbpath, 'FamilyMembers'))
    .then((res)=>console.log(res))
    .then(()=>AddQuiz(dbpath, "あああああ", "めん", "スパゲティ", "カレーライス", 8))
    .then((res)=>{
        console.log(res);
        return RemoveQuiz(dbpath, 3);
    }).then((res)=>{
        console.log(res);
        return DisplayTable(dbpath, 'Quiz');
    }).catch(er=>console.log(er));
    
}
*/
