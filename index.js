const WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, path = require('path')
	, net = require('net')
	, fs = require('fs-extra')
	, os = require('os')
	, app = express();

var connectedClients = [];
var PORT = 9002;

function getIndex(match) {
	for (let i = 0; i < connectedClients.length; i++) {
		if (connectedClients[i].web == match) {
			return connectedClients[i];
		}
	}
}

function getClient(id) {
	for (let i = 0; i < connectedClients.length; i++) {
		if (connectedClients[i].id == id) {
			return connectedClients[i];
		}
	}
}

app.use(express.static(path.join(__dirname, '/public')))

var server = http.createServer(app)
var wss = new WebSocketServer({ server: server })

wss.on('connection', function (ws, req) {
	console.info(`[log] Got A Client ${req.socket.remoteAddress}`);
	let a = {
		web: ws,
		id: 0,
		publicKey: ''
	};
	connectedClients.push(a);
	ws.on('message', function (e) {
		if (typeof e != 'string') {
			connectedClients.forEach((client) => {
				if (client.web != ws) {
					client.web.send(e);
				}
			});
			return;
		} else {
			let data = JSON.parse(e);
			let client = getIndex(ws);
			if (data && client) {
				client.id = data.id;
				client.publicKey = data.data;
				let contact = getClient(data.contactid);
				if (contact) {
					contact.web.send(e);
					let a = {
						type: 'publickey',
						data: contact.publicKey
					};
					ws.send(JSON.stringify(a));
				}
			}
		}
	});

	ws.on('close', function (e) {
		console.info('[log] Lost A Client');
		for (let i = 0; i < connectedClients.length; i++) {
			if (connectedClients[i].web == ws) {
				connectedClients.splice(i, 1);
				break;
			}
		}
	});
});

server.listen(PORT)
console.info('[log] Listening on port %d', PORT)