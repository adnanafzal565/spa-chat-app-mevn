// include express framework
const express = require("express");

// create an instance of it
const app = express();

const auth = require("./modules/auth");
// custom modules
const contact = require("./modules/contact");
const chat = require("./modules/chat")

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// create http server from express instance
const http = require("http").createServer(app);

// database module
var mongodb = require("mongodb");

// client used to connect with database
var MongoClient = mongodb.MongoClient;

// each Mongo document's unique ID
var ObjectId = mongodb.ObjectId;

// module required for parsing FormData values
const expressFormidable = require("express-formidable");

// setting the middleware
app.use(expressFormidable());

const fileSystem = require("fs")

// allow to read pictures from uploads/profiles folder publicly
app.use("/uploads/profiles", express.static(__dirname + "/uploads/profiles"))

// module required for encrypting the passwords
// and verify the password as well
const bcrypt = require("bcryptjs");

// JWT used for authentication
const jwt = require("jsonwebtoken");

// secret JWT key
const jwtSecret = "jwtSecret1234567890";

// sockets are used for realtime communication
const socketIO = require("socket.io")(http, {
    cors: {
        origin: ["http://localhost:8080", "http://172.20.10.4:8080"]
    }
});

const apiURL = "http://localhost:3000"
const mainURL = "http://localhost:8080"

// array that holds all connected users socket ID
global.users = [];

// start the server at port 3000 (for local) or for hosting server port
http.listen(process.env.PORT || 3000, function () {
    console.log("Server has been started at: " + (process.env.PORT || 3000));

    // connect with database
    MongoClient.connect("mongodb://localhost:27017", function (error, client) {
        if (error) {
            console.error(error);
            return;
        }

        // database name
        db = client.db("mevn_chat_app_free");
        global.db = db;
        console.log("Database connected");

        socketIO.on("connection", function (socket) {

            socket.on("connected", function (email) {
                global.users[email] = socket.id;
            });
        });

        contact.init(app, express);
        chat.init(app, express);
        chat.socketIO = socketIO

        app.post("/updateProfile", auth, async function (request, result) {
            const user = request.user
            const name = request.fields.name
            const picture = request.files.picture
            const previousPicture = user.picture

            let picturePath = ""
            if (picture != null && picture.size > 0) {
                if (picture.type == "image/jpeg" || picture.type == "image/png") {
                    picturePath = "uploads/profiles/" + user.email.split(".")[0] + "-" + picture.name

                    fileSystem.readFile(picture.path, function (error, data) {
                        if (error) {
                            console.error(error)
                            return
                        }

                        fileSystem.writeFile(picturePath, data, function (error) {
                            if (error) {
                                console.error(error)
                                return
                            }

                            if (previousPicture) {
                                fileSystem.unlink(previousPicture, function (error) {
                                    if (error) {
                                        console.error(error)
                                    }
                                })
                            }
                        })

                        fileSystem.unlink(picture.path, function (error) {
                            if (error) {
                                console.error(error)
                            }
                        })
                    })
                }
            }

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    "name": name,
                    "picture": picturePath
                }
            })

            user.name = name
            user.picture = picturePath

            delete user.password
            delete user.accessToken
            delete user.createdAt
            delete user.verifiedAt
            delete user.verificationCode
            delete user.resetToken

            result.json({
                status: "success",
                message: "Profile has been updated.",
                user: user
            })
        })

        app.post("/deleteNotification", auth, async function (request, result) {
            // get authenticated user
            const user = request.user;

            const _id = request.fields._id;

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $pull: {
                    notifications: {
                        _id: ObjectId(_id)
                    }
                }
            });

            result.json({
                status: "success",
                message: "Notification has been removed."
            });
        });

        app.post("/markNotificationsAsRead", auth, async function (request, result) {
            // get authenticated user
            const user = request.user;

            // mark isRead to true in each element of notifications array 
            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    "notifications.$[].isRead": true
                }
            });

            result.json({
                status: "success",
                message: "Notification has been marked as read."
            });
        });

        // an API to search for contacts
        app.post("/search", auth, async function (request, result) {
            // get authenticated user
            const user = request.user;

            // get searched query
            const query = request.fields.query;

            // create an empty array
            const contacts = [];

            // loop through all contacts
            for (let a = 0; a < user.contacts.length; a++) {

                // check where name or email matches with query
                if (user.contacts[a].name.includes(query)
                    || user.contacts[a].email.includes(query)) {

                    // add in contacts array
                    contacts.push(user.contacts[a]);
                }
            }

            // return the new contacts array
            result.json({
                status: "success",
                message: "Data has been fetched.",
                contacts: contacts
            });
        });

        // route for logout request
        app.post("/logout", auth, async function (request, result) {
            const user = request.user;

            // update JWT of user in database
            await db.collection("users").findOneAndUpdate({
                "_id": user._id
            }, {
                $set: {
                    "accessToken": ""
                }
            });

            result.json({
                status: "success",
                message: "Logout successfully."
            });
        });

        app.post("/getUser", auth, async function (request, result) {
            const user = request.user;

            // get number of unread notifications
            let unreadNotifications = 0;
            if (user.notifications) {
                for (let a = 0; a < user.notifications.length; a++) {
                    if (!user.notifications[a].isRead) {
                        unreadNotifications++;
                    }
                }
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: user,

                // send to client
                unreadNotifications: unreadNotifications
            });
        });

        // route for login requests
        app.post("/login", async function (request, result) {

            // get values from login form
            const email = request.fields.email;
            const password = request.fields.password;

            // check if email exists
            const user = await db.collection("users").findOne({
                "email": email
            });

            if (user == null) {
                result.json({
                    "status": "error",
                    "message": "Email does not exists."
                });
                return;
            }

            if (user.verifiedAt == null) {
                result.json({
                    "status": "error",
                    "message": "Your email is not verified. Kindly verify your account."
                });
                return;
            }

            // for Heroku
            bcrypt.compare(password, user.password, async function(err, res) {
                if (res === true) {
                    // generate JWT of user
                    const accessToken = jwt.sign({
                        "userId": user._id.toString()
                    }, jwtSecret);

                    // update JWT of user in database
                    await db.collection("users").findOneAndUpdate({
                        "email": email
                    }, {
                        $set: {
                            "accessToken": accessToken
                        }
                    });

                    result.json({
                        status: "success",
                        message: "Login successfully.",
                        accessToken: accessToken
                    });

                    return;
                }

                result.json({
                    "status": "error",
                    "message": "Password is not correct."
                });
            });

            // check if password is correct
            /*bcrypt.compare(password, user.password, async function (error, isVerify) {
                if (isVerify) {

                    // generate JWT of user
                    const accessToken = jwt.sign({
                        "userId": user._id.toString()
                    }, jwtSecret);

                    // update JWT of user in database
                    await db.collection("users").findOneAndUpdate({
                        "email": email
                    }, {
                        $set: {
                            "accessToken": accessToken
                        }
                    });

                    result.json({
                        status: "success",
                        message: "Login successfully.",
                        accessToken: accessToken
                    });

                    return;
                }

                result.json({
                    "status": "error",
                    "message": "Password is not correct."
                });
            });*/
        })

        app.post("/registration", async function (request, result) {
            const name = request.fields.name;
            const email = request.fields.email;
            const password = request.fields.password;
            const createdAt = new Date().getTime();

            if (!name || !email || !password) {
                result.json({
                    status: "error",
                    message: "Please enter all values."
                });
                return;
            }

            // check if email already exists
            var user = await db.collection("users").findOne({
                email: email
            });

            if (user != null) {
                result.json({
                    "status": "error",
                    "message": "Email already exists."
                });
                return;
            }

            // for Heroku
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, async function(err, hash) {

                    // insert in database
                    await db.collection("users").insertOne({
                        name: name,
                        email: email,
                        password: hash,
                        picture: "",
                        accessToken: "",
                        contacts: [],
                        notifications: [],
                        verifiedAt: new Date().getTime(),
                        resetToken: "",
                        createdAt: createdAt
                    })

                    result.status(200).json({
                        status: "success",
                        message: "User has been signed up."
                    });
                });
            });

            // encrypt the password
            /*bcrypt.hash(password, 10, async function (error, hash) {

                // insert in database
                await db.collection("users").insertOne({
                    name: name,
                    email: email,
                    password: hash,
                    accessToken: "",
                    contacts: [],
                    notifications: [],
                    createdAt: createdAt
                });

                result.status(200).json({
                    status: "success",
                    message: "User has been signed up."
                });
            });*/
        });
    });

});