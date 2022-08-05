async function main(){
    let i=0;
    setInterval(()=>{
        i++;
        console.log(i);
        if(i > 10){
            process.exit();
        }
    }, 1000);
}

main();