const jwt = require("jsonwebtoken")
const jwtSecret = "jwtSecret1234567890"

var mongodb = require("mongodb")
var ObjectId = mongodb.ObjectId

module.exports = async function (request, result, next) {
    try {
        const accessToken = request.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(accessToken, jwtSecret)
        const userId = decoded.userId

        const user = await db.collection("users").findOne({
            accessToken: accessToken
        })

		if (user == null) {
			result.json({
	            status: "error",
	            message: "User has been logged out."
	        })
			return
		}

        delete user.password
        delete user.accessToken
        delete user.createdAt
        delete user.verifiedAt
        delete user.resetToken

        request.user = user
        next()
    } catch (exp) {
        result.json({
            status: "error",
            message: "User has been logged out."
        })
    }
}