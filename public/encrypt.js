function Cipher(importedpublickey){ 
	this.importpublicKey;
	this.exportpublicKey;
	this.importprivateKey;
	this.GenerateKey();
}

Cipher.prototype.encryptMessage = async function(plaintext){
	let encoded = this.encode(this.texttobase64(plaintext));
	let ciphertext = await window.crypto.subtle.encrypt(
	   {
		   name: "RSA-OAEP"
	   },
		   this.importpublicKey,
		   encoded
	);
	return ciphertext;
	//let buffer = new Uint8Array(this.ciphertext, 0, 5);
};

Cipher.prototype.decryptMessage = async function(ciphertext){
	let decrypted = await window.crypto.subtle.decrypt(
		{
			name: "RSA-OAEP"
		},
			this.importprivateKey,
			ciphertext
	);
	let decoded = this.decode(decrypted)
	let plaintext = this.base64totext(decoded);
	return plaintext;
};

Cipher.prototype.texttobase64 = function(text){
	return window.btoa(text);
};

Cipher.prototype.base64totext = function(base64){
	return window.atob(base64);
} ;

Cipher.prototype.encode = function(pattern){
	let encoder = new TextEncoder();
	return encoder.encode(pattern);
};

Cipher.prototype.decode = function(pattern){
	let decoder = new TextDecoder();
	return decoder.decode(pattern);
};

Cipher.prototype.GenerateKey = function(){
	try{	
		window.crypto.subtle.generateKey(
			{
			name: "RSA-OAEP",//2048
			// Consider using a 4096-bit key for systems that require long-term security
			modulusLength: 4096,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
			},
			true,
			["encrypt", "decrypt"]
			).then((keyPair) => {
				this.ExportKey(keyPair.publicKey,keyPair.privateKey);
			});
	}catch(err){
		alert('Error In Generating Key');
	}
};

Cipher.prototype.ExportKey = async function(Key,privateKey){
	const exported = await window.crypto.subtle.exportKey("jwk",Key);
	this.exportpublicKey = JSON.stringify(exported);
	this.imExprivate(privateKey);
};

Cipher.prototype.ImportKey = async function(format){
	const imported = await window.crypto.subtle.importKey(
	"jwk",
	JSON.parse(format),
	{
		name: "RSA-OAEP",
		hash: "SHA-256",
	},
	true,
	["encrypt"]
	);
	this.importpublicKey = imported;
	return 1;
};

Cipher.prototype.imExprivate = async function(Key){
	const exported = await window.crypto.subtle.exportKey("jwk",Key);
	const format = JSON.stringify(exported);
	const imported = await window.crypto.subtle.importKey(
		"jwk",
		JSON.parse(format),
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		true,
		["decrypt"]
		);
	this.importprivateKey = imported;
};

document.addEventListener('DOMContentLoaded', (e) => {
	
});