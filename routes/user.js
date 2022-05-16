const express = require('express')
const userRouter = express.Router()
const md5 = require("md5");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { getDbInstance } = require('../db');
const { ObjectId } = require('mongodb');

userRouter.get("/", async(req, res) => {
    // fs.readFile("users.json", "utf8", function(err, data) {
    //     console.log(data);
    //     res.status(200).json(JSON.parse(data)).end();
    // });
    const user = await (await getDbInstance()).collection('user').find({}).toArray();
    res.status(200).json(user).end()

});

userRouter.get("/:id", async(req, res) => {
    try {
        let users;
        const query = { _id: ObjectId(req.params.id) }
        console.log(query)

        users = await (await getDbInstance()).collection('user').findOne(query);
        console.log(users)
        res.status(200).json(users).end();
        // fs.readFile("users.json", "utf8", function(err, data) {
        //     users = JSON.parse(data);
        //     const user = users.find((user) => user.id === req.params.id);
        //     if (!user) {
        //         return res.status(400).json({ message: "user not found!" }).end();
        //     }
        //     res.status(200).json(user).end();
        // });
    } catch (error) {
        res.status(400).json({ error: error.message });

    }
});

userRouter.post("/", async(req, res) => {
    if (req.body.password.length < 5) {
        return res.status(400).json({ message: "password invalid" }).end();
    }
    const user = (await getDbInstance()).collection('user').insertOne({
        username: req.body.username,
        password: md5(req.body.password),
    });
    console.log(user)
    return res.status(200).end()
});

userRouter.put("/:id", (req, res) => {
    const user = users.find((user) => user.id === req.params.id);
    if (!user) {
        return res.status(400).json({ message: "user not found!" }).end();
    }
    user.username = req.body.username;
    user.password = md5(req.body.password);

    res.status(200).json({ message: "edit success" }).end();
});

userRouter.delete("/:id", (req, res) => {
    const user = users.find((user) => user.id === req.params.id);
    if (!user) {
        return res.status(400).json({ message: "user not found!" }).end();
    }
    users = users.filter((user) => user.id !== req.params.id);
    res.status(200).json({ message: "delete success" }).end();
    // const users = (await getDbInstance()).collection('user').delete({ username: "admin" })
    // console.log(users)
});

module.exports = userRouter