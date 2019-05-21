const net = require('net');

const chatRooms = [0];

const clients = {};

const keys = {
    '#end': (str, client) => {
        clients[client].destroy();
        console.log('close connection ' + client);
    },
    '#createChat': (client_2, creator) => {
        const interlocutor = client_2.match(/[0-9]{5}/)[0];
        console.log(interlocutor);
        if (client_2.search(/[0-9]{5}/) !== -1) {
            let status = 1;
            chatRooms.find((el, index) => {
                if (el[creator]) {
                    clients[creator].write('You already have a chat. Leave it before creating a new one.');
                    status = 0;
                } else if (el[interlocutor]) {
                    clients[creator].write('Your interlocutor is bysy choose another one');
                    status = 0;
                }
            });
            if (status === 1) {
                let obj = {};
                obj[creator] = 'creator';
                obj[interlocutor] = 'interlocutor';
                if (clients[interlocutor]) {
                    clients[interlocutor].write('You have been added to chat: ' + chatRooms.length);
                    chatRooms.push(obj);
                } else {
                    clients[creator].write(interlocutor + ' invalid address,\nlist of addresses:\n' + Object.keys(clients));
                }
            }
        } else {
            clients[creator].write('Wrong address');
        }
        console.log(chatRooms);
    },
    '#addToChat': (str) => {
        let roomIndex = str.match(/[0-9]+/)[0];
        let human = str.match(/[0-9]{5}/)[0];
        chatRooms[roomIndex][human] = 'interlocutor';
    },
    "#exit": (str, client) => {
        chatRooms.find((el, index) => {
            if (el[client]) {
                delete chatRooms[index][client];
            }
            if (Object.keys(chatRooms[index]).length === 0 && typeof chatRooms[index] === 'object') {
                chatRooms.splice(index, 1);
            }
            console.log(chatRooms);
        });
    },
    '#list': (str, client) => {
        clients[client].write('List of users:\n' + Object.keys(clients));
    }
};

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        let stringData = data.toString();
        if (stringData[0] === '#') {
            if (!keys[stringData.match(/#[a-z]+/i)]) {
                clients[socket.remotePort].write('Invalid command, list of commands:\n' + Object.keys(keys).join(',\n'));
                return false;
            } else {
                keys[stringData.match(/#[a-z]+/i)](stringData.trim(), socket.remotePort);
            }
            return true;
        } else if (chatRooms.length > 1) {
            let indexRoom;
            chatRooms.find((el, index) => {
                if (el[socket.remotePort]) {
                    indexRoom = Object.keys(chatRooms[index]);
                    return true;
                }
            });
            indexRoom.forEach(element => {
                if (element != socket.remotePort) {
                    clients[element].write(socket.remotePort + ': ' + stringData);
                }
            });
        } else {
            socket.write('Choose you interlocutor:\n' + Object.keys(clients));
        }
    });
});

server.on('connection', (client) => {
    clients[client.remotePort] = client;
    console.log('added client ' + client.remotePort);
});

server.listen(1337, '127.0.0.1');
