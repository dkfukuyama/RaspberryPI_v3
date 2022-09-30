import {GoogleHomeController } from '@/GoogleHomeController';

async function main() {
    console.log("------- start -----------");

    let gh = new GoogleHomeController("192.168.1.28", 1000);

    GoogleHomeController.init();
    GoogleHomeController.startSeekGoogleLoop();

    setInterval(() => {
        console.log(GoogleHomeController.getGoogleHomeAddresses())
    }, 1500);
}

main();

