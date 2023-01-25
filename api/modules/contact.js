const auth = require("./auth")
const ObjectId = require("mongodb").ObjectId
// module required for encrypting the passwords
// and verify the password as well
const bcrypt = require("bcryptjs")

require("./globals")

module.exports = {

    init: function (app, express) {
        const router = express.Router()

        router.post("/search", auth, async function (request, result) {
            const user = request.user
            const searchContact = request.fields.searchContact

            const contacts = []
            for (let a = 0; a < user.contacts.length; a++) {
                if (user.contacts[a].name.includes(searchContact) || user.contacts[a].email.includes(searchContact)) {
                    contacts.push(user.contacts[a])
                }
            }

            result.json({
                status: "success",
                message: "Contacts has been fetched.",
                data: contacts
            })
        })

        router.post("/delete", auth, async function (request, result) {
            const _id = request.fields._id
            const user = request.user

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

            const contactUser = await db.collection("users").findOne({
                $and: [{
                    _id: user._id
                }, {
                    "contacts.email": receiver.email
                }]
            });

            if (contactUser == null) {
                result.json({
                    status: "error",
                    message: "User not found."
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

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $pull: {
                    "contacts": {
                        "email": receiver.email
                    }
                }
            });

            result.json({
                status: "success",
                message: "Contact has been deleted."
            });
        });

        router.post("/fetch", auth, async function (request, result) {
            const user = request.user;

            result.json({
                status: "success",
                message: "Contacts has been fetched.",
                contacts: user.contacts
            });
        });

        router.post("/save", auth, async function (request, result) {
            const name = request.fields.name;
            const email = request.fields.email;
            const user = request.user;

            const contactUser = await db.collection("users").findOne({
                email: email
            });

            if (contactUser == null) {
                result.json({
                    status: "error",
                    message: "User not found."
                });
                return;
            }

            const userContact = await db.collection("users").findOne({
                $and: [{
                    _id: user._id
                }, {
                    "contacts._id": contactUser._id
                }]
            });

            if (userContact != null) {
                result.json({
                    status: "error",
                    message: "Contact already exists."
                });
                return;
            }

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $push: {
                    contacts: {
                        _id: contactUser._id,
                        name: name,
                        email: email,
                        unreadMessages: 0
                    }
                }
            });

            result.json({
                status: "success",
                message: "Contact has been saved."
            });
        });

        app.use("/contact", router);
    }
};