const baseURL = "http://localhost:3000"
global.baseURL = baseURL

const fileSystem = require("fs");

const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; // Using AES encryption
const key = "adnan-tech-programming-computers"; // must be of 32 characters

global.encrypt = function (text) {
	const iv = crypto.randomBytes(16);

    // protected data
    const message = text;

    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // encrypt the message
    // input encoding
    // output encoding
    let encryptedData = cipher.update(message, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    const base64data = Buffer.from(iv, 'binary').toString('base64');
    return {
        iv: base64data,
        encryptedData: encryptedData
    };
};

global.decrypt = function (text) {
    const origionalData = Buffer.from(text.iv, 'base64') 

    const decipher = crypto.createDecipheriv(algorithm, key, origionalData);
    let decryptedData = decipher.update(text.encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};

// function to encode file data to base64 encoded string
global.base64Encode = function(file) {
    // read binary data
    var bitmap = fileSystem.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

global.existsInContact = function (user, _id) {
    for (let a = 0; a < user.contacts.length; a++) {
        if (user.contacts[a]._id.toString() == _id.toString()) {
            return {
                password: ""
            }
        }
    }
    return null
}