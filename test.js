const dgram = require("dgram");
const PORT = 23456;
const HOST = '192.168.8.14';

const gainInfo = Buffer.from([0x55, 0x00, 0x00, 0x40, 0x40, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0xAA]);
const returnOK = Buffer.from([0x55, 0x00, 0x00, 0x80, 0x40, 0x06, 0x00, 0x01, 0x10, 0x02, 0x00, 0x04, 0x00, 0xAA]);

const client = dgram.createSocket('udp4');

client.on("message", function(msg, rinfo) {
    console.log(msg.compare(returnOK))
    console.log(msg.length);
    console.log(`UDP message received from: ${rinfo.address}:${rinfo.port} - ${msg}`);
    let modelName = false;
    for (var i = 0; i < msg.length; i++) {
        let buf = msg.slice(i, i + 1);
        if (typeof modelName === 'boolean' && buf.compare(Buffer.from([0x5A])) === 0) {
            modelName = "";
        } else {
            if (typeof modelName === 'string') {
                if (modelName != "" && buf.compare(Buffer.from([0x00])) === 0) {
                    break;
                }
                modelName += buf.toString()
            }
        }
    }
    console.log('last', modelName);

});

client.send(gainInfo, 0, gainInfo.length, PORT, HOST, function(err, bytes) {
    if (err) {
        console.error(`UDP message send error:`, err);
    } else {
        console.log(`UDP message sent to ${HOST}:${PORT}`);
    }
});