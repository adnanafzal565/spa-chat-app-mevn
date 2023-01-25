const mongodb = require("mongodb")
const ObjectId = mongodb.ObjectId
const fileSystem = require("fs")

// module required for encrypting the passwords
// and verify the password as well
const bcrypt = require("bcryptjs")

const auth = require("./auth")
require("./globals")

module.exports = {

    socketIO: null,

    init: function (app, express) {
        const self = this
        const router = express.Router()

        router.post("/search", auth, async function (request, result) {
            const user = request.user
            const search = request.fields.search
            const email = request.fields.email
            const password = request.fields.password

            const receiver = await db.collection("users").findOne({
                email: email
            })

            if (receiver == null) {
                result.json({
                    status: "error",
                    message: "The receiver is not a member of Chat Station."
                })
                return
            }

            const contactObj = existsInContact(user, receiver._id)
            if (contactObj == null) {
                result.json({
                    status: "error",
                    message: "Contact not found."
                })
                return
            }

            const messages = await db.collection("messages").find({
                $and: [{
                    $or: [{
                        "sender._id": user._id,
                        "receiver.email": email
                    }, {
                        "sender.email": email,
                        "receiver._id": user._id
                    }]
                }, {
                    // previous messages will not have "type" key
                    // so we will know that they are private messages
                    $or: [{
                        type: {
                            $exists: false
                        }
                    }, {
                        // and future messages will have type=private
                        type: "private"
                    }]
                }]
            })
                .sort("createdAt", -1)
                .toArray();

            const data = [];
            for (let a = 0; a < messages.length; a++) {
                const message = decrypt(messages[a].message)
                if (message.includes(search)) {
                    data.push({
                        _id: messages[a]._id.toString(),
                        message: message,
                        sender: {
                            email: messages[a].sender.email,
                            name: messages[a].sender.name,
                            picture: messages[a].sender.picture
                        },
                        receiver: {
                            email: messages[a].receiver.email,
                            name: messages[a].receiver.name,
                            picture: messages[a].receiver.picture
                        },
                        createdAt: messages[a].createdAt
                    })
                }
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                data: data
            });
        })

        router.post("/fetch", auth, async function (request, result) {
            const user = request.user
            const _id = request.fields._id
            const password = request.fields.password
            const page = request.fields.page ?? 0
            const limit = 10

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Please enter all fields."
                })
                return
            }

            const receiver = await db.collection("users").findOne({
                _id: ObjectId(_id)
            })

            if (receiver == null) {
                result.json({
                    status: "error",
                    message: "The receiver is not a member of Chat Station."
                })
                return
            }

            const contactObj = existsInContact(user, receiver._id)
            if (contactObj == null) {
                result.json({
                    status: "error",
                    message: "Contact not found."
                })
                return
            }

            const totalMessages = await db.collection("messages").find({
                $and: [{
                    $or: [{
                        "sender._id": user._id,
                        "receiver._id": receiver._id
                    }, {
                        "sender._id": receiver._id,
                        "receiver._id": user._id
                    }]
                }, {
                    // previous messages will not have "type" key
                    // so we will know that they are private messages
                    $or: [{
                        type: {
                            $exists: false
                        }
                    }, {
                        // and future messages will have type=private
                        type: "private"
                    }]
                }]
            }).count()

            const messages = await db.collection("messages").find({
                $and: [{
                    $or: [{
                        "sender._id": user._id,
                        "receiver._id": receiver._id
                    }, {
                        "sender._id": receiver._id,
                        "receiver._id": user._id
                    }]
                }, {
                    // previous messages will not have "type" key
                    // so we will know that they are private messages
                    $or: [{
                        type: {
                            $exists: false
                        }
                    }, {
                        // and future messages will have type=private
                        type: "private"
                    }]
                }]
            })
                .sort("createdAt", -1)
                .skip(page * limit)
                .limit(limit)
                .toArray();

            const data = [];
            for (let a = 0; a < messages.length; a++) {
                data.push({
                    _id: messages[a]._id.toString(),
                    message: decrypt(messages[a].message),
                    sender: {
                        email: messages[a].sender.email,
                        name: messages[a].sender.name,
                        picture: messages[a].sender.picture
                    },
                    receiver: {
                        email: messages[a].receiver.email,
                        name: messages[a].receiver.name,
                        picture: messages[a].receiver.picture
                    },
                    createdAt: messages[a].createdAt
                });
            }

            let unreadMessages = 0;
            for (let a = 0; a < data.length; a++) {
                if (data[a].receiver.email == user.email && !data[a].isRead) {
                    await db.collection("messages").updateMany({
                        _id: ObjectId(data[a]._id)
                    }, {
                        $set: {
                            "isRead": true
                        }
                    })

                    unreadMessages++;
                }
            }

            await db.collection("users").findOneAndUpdate({
                $and: [{
                    "_id": user._id
                }, {
                    "contacts.email": receiver.email
                }]
            }, {
                $inc: {
                    "contacts.$.unreadMessages": -unreadMessages
                }
            });

            result.json({
                status: "success",
                message: "Messages has been fetched.",
                messages: data,
                totalMessages: totalMessages,
                user: {
                    email: user.email,
                    name: user.name,
                    contacts: user.contacts
                },
                receiver: {
                    email: receiver.email,
                    name: receiver.name,
                    picture: receiver.picture
                }
            })
        })

        router.post("/send", auth, async function (request, result) {
            const user = request.user
            const _id = request.fields._id
            const message = request.fields.message
            const password = request.fields.password
            const createdAt = new Date().getTime()

            if (!_id || !message) {
                result.json({
                    status: "error",
                    message: "Please enter all fields."
                });
                return;
            }

            // Text send to encrypt function
            const hw = encrypt(message);

            const receiver = await db.collection("users").findOne({
                _id: ObjectId(_id)
            });

            if (receiver == null) {
                result.json({
                    status: "error",
                    message: "The receiver is not a member of Chat Station."
                });
                return;
            }

            const contactObj = existsInContact(user, receiver._id)
            if (contactObj == null) {
                result.json({
                    status: "error",
                    message: "Contact not found."
                })
                return
            }

            const senderObj = {
                _id: user._id,
                name: user.name,
                email: user.email
            }
            if (typeof user.picture !== "undefined" && user.picture != "") {
                senderObj.picture = user.picture
            }
            const receiverObj = {
                _id: receiver._id,
                name: receiver.name,
                email: receiver.email
            }
            if (typeof receiver.picture !== "undefined" && receiver.picture != "") {
                receiverObj.picture = receiver.picture
            }

            const object = {
                message: hw,
                sender: senderObj,
                receiver: receiverObj,
                type: "private",
                createdAt: createdAt
            }

            const document = await db.collection("messages").insertOne(object);

            await db.collection("users").findOneAndUpdate({
                $and: [{
                    "_id": receiver._id
                }, {
                    "contacts._id": user._id
                }]
            }, {
                $inc: {
                    "contacts.$.unreadMessages": 1
                }
            });

            const messageObject = {
                _id: document.insertedId,
                message: message,
                sender: object.sender,
                receiver: object.receiver,
                type: "private",
                createdAt: createdAt
            };

            if (typeof global.users[receiver.email] !== "undefined") {
                self.socketIO.to(global.users[receiver.email]).emit("sendMessage", {
                    title: "New message has been received.",
                    data: messageObject
                });
            }

            result.json({
                status: "success",
                message: "Message has been sent.",
                messageObject: messageObject
            });
        });

        app.use("/chat", router);
    }
};