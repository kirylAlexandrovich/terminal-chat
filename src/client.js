const net = require('net');

const client = new net.Socket();
client.connect(1337, () => {
    console.log('Connected');
});

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    let chunk;
    
    while ((chunk = process.stdin.read()) !== null) {
        client.write(chunk, client);   
    }
});

client.on('data', (data) => {
    console.log(data.toString().trim());
});

client.on('close', () => {
    process.exit();
    console.log('Connection closed');
});
