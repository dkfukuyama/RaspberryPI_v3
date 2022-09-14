const PlatformSender = require('castv2-client').PlatformSender;
let PfSender = new PlatformSender();


PfSender.on('error', (data) => {
    console.error("ON ERROR");

    if (data.data = "Error: Device timeout") {
        PfSender.close();
    }
});

PfSender.connect("192.168.1.21", () => {

    console.log("CONNECTION OK");

    
});

