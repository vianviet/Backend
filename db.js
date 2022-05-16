const mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
const MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
const url = process.env.URLMONGO;

let client;
const getDbInstance = async() => {
    try {
        if (!client) {
            client = await MongoClient.connect(url);
        }
        return client.db("backend");
    } catch (error) {
        throw new Error("Can't connect database");
    }

}

module.exports = {
    getDbInstance
}