function $(id) {
	return document.getElementById(id);
}

var now = new Date();
function log(text, type) {
	switch (type) {
		case 'other': {
			$('chat-message-list').appendChild(other(text));
			break;
		} default: {
			$('chat-message-list').appendChild(you(text));
			break;
		}
	}
}

function you(text) {
	var div0 = document.createElement('div');
	div0.setAttribute('class', 'message-row you-message');
	var div1 = document.createElement('div');
	div1.setAttribute('class', 'message-content');
	var div2 = document.createElement('div');
	div2.setAttribute('class', 'message-text');
	div2.innerText = text;
	var div3 = document.createElement('div');
	div3.setAttribute('class', 'message-time');
	timeNow = now.toLocaleString().trim().split(',')[1].trim().split(':');
	div3.innerText = timeNow[0] + ":" + timeNow[1] + " " + timeNow[2].trim().split(' ')[1];

	div1.appendChild(div2);
	div1.appendChild(div3);
	div0.appendChild(div1);
	return div0;
}

function other(text) {
	var div0 = document.createElement('div');
	div0.setAttribute('class', 'message-row other-message');
	var div1 = document.createElement('div');
	div1.setAttribute('class', 'message-content');
	var img = document.createElement('img');
	img.src = "ic.png";
	img.alt = "Darlene";
	var div2 = document.createElement('div');
	div2.setAttribute('class', 'message-text');
	div2.innerText = text;
	var div3 = document.createElement('div');
	div3.setAttribute('class', 'message-time');
	timeNow = now.toLocaleString().trim().split(',')[1].trim().split(':');
	div3.innerText = timeNow[0] + ":" + timeNow[1] + " " + timeNow[2].trim().split(' ')[1];

	div0.appendChild(img);
	div1.appendChild(div2);
	div1.appendChild(div3);
	div0.appendChild(div1);
	return div0;
}

document.addEventListener('DOMContentLoaded', function () {
	var cipher = new Cipher();
	$('input').disabled = true;
	$('attach').onclick = function (e) {
		const input = document.createElement('input');
		input.type = 'file';
		input.onchange = function (e) {
			getFile(e);
		};
		input.click();
	};

	/*$('input').addEventListener('keydown', function(e) {
		if(e.keyCode == 13){
			log(this.value);
		}
	});*/
	function getFile(e) {
		window.FileChunk = [];

		parseFile(e.target.files[0]);

		console.log(window.FileChunk);
	}
	var parseFile = function (file) {
		var chunkSize = 1024 * 1024 * 4;
		var fileSize = file.size;
		var currentChunk = 1;
		var totalChunk = Math.ceil((fileSize / chunkSize), chunkSize);
		var currentIndex = 0;

		while (currentChunk <= totalChunk) {
			var offset = (currentChunk - 1) * chunkSize;
			var currentFilePart = file.slice(offset, (offset + chunkSize));

			window.FileChunk[currentIndex] = currentFilePart;
			currentIndex++;
			currentChunk++;
		}
	};

	var result = prompt('Enter Your ID Number ?', 1234);
	var result1 = prompt('Enter Your Friend ID Number ?', 4321);
	if (result && result1) {

		setTimeout(function () {
			var address = window.location.href.replace('http', 'ws');
			var ws = new WebSocket(address);
			ws.binaryType = "arraybuffer";
			ws.addEventListener('open', function () {
				$('info').innerText = 'Online';
				var a = {
					id: result,
					contactid: result1,
					type: 'publickey',
					data: cipher.exportpublicKey
				};
				ws.send(JSON.stringify(a));
			});
			ws.addEventListener('close', function (e) {
				$('info').innerText = 'Offline';
				//console.log(e);
			});
			ws.addEventListener('message', function (e) {
				if (e.data instanceof ArrayBuffer) {
					cipher.decryptMessage(e.data).then(function (succ) {
						log(succ, 'other');
					}, function (err) {
						console.log(err);
					});
				} else {
					var json = JSON.parse(e.data)
					if (json.type == 'publickey') {
						var statusCode = cipher.ImportKey(json.data);
						statusCode.then(function (succ) {
							if (succ == 1) {
								$('input').disabled = false;
							}
						}, function (err) {
							console.log(err);
						});
					}
				}
			});
			ws.addEventListener('error', function (e) {
				console.log(e);
			});
			$('input').addEventListener('keydown', function (e) {
				if (ws && ws.readyState == 1 && e.keyCode == 13) {
					//console.log(ws);
					if (ws.bufferedAmount == 0) {
						log(this.value);
						try {
							cipher.encryptMessage(this.value).then(function (succ) {
								/*var a = {
									id:result,
									contactid:result1,
									message:succ
								};*/
								//console.log(JSON.parse(JSON.stringify(succ)));
								ws.send(succ);
								$('input').value = '';
							}, function (err) {
								console.log(err);
							});
						} catch (err) {
							console.log(err);
						}
					}
					//ws.send(this.value);
					//this.value = '';
				}
			});
		}, 5000);//1e3
	}
});
