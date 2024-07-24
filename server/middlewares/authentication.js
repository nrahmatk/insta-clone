const { ObjectId } = require("mongodb")
const { getDB } = require("../config/mongoDb")
const { verifyToken } = require("../helpers/jwt")


async function authentication(req) {
    try {
        if(!req.headers.authorization) {
            throw {name: "UNAUTHORIZED"}
        }

        const token = req.headers.authorization.split(' ')[1]
        const payload = verifyToken(token)
        
        const db = await getDB()
        const userCollection = db.collection('user')
        const user = await userCollection.findOne({ _id: new ObjectId(payload.id) })

        if(!user){
            throw new Error("UNAUTHORIZED");
        }

        return {
            id: user._id,
            username: user.username,
            imgUrl: user.imgUrl
        }

    } catch (error) {
        console.log(error)
        throw new Error("UNAUTHORIZED");
    }
}

module.exports = authentication