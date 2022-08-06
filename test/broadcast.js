const broadcastAddress = require('broadcast-address');
const dgram = require('dgram');

const message = Buffer.from('Some bytes');
const client = dgram.createSocket('udp4');

const broadcastBuffer3 = Buffer.from([85, 0, 255, 63, 64, 4, 0, 1, 0, 0, 0, 170])

const ip = broadcastAddress('en0')

console.log(ip)

client.send(broadcastBuffer3, 23456, ip, (err) => {
});

client.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  client.close();
});

client.on('message', (msg, rinfo) => {
  console.log(Array.prototype.slice.call(msg).join(' '))
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

client.on('listening', () => {
  const address = client.address();
  console.log(`server listening ${address.address}:${address.port}`);
  client.setBroadcast(true);
});