const express = require("express");
require("dotenv").config();
const { getDbInstance } = require('./db');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');
const port = process.env.PORT;
const cron = require('node-cron');
const { transporter } = require("./transporter");


const options = {
    from: "anhdaonapa123@gmail.com",
    to: "vianviet2502@gmail.com",
    subject: "Hello",
    html: "Hello my friend !"
}
const main = async() => {
    await getDbInstance();
    const app = express();
    app.use(express.json());
    app.use('/users', userRouter)
    app.use('/upload', uploadRouter)
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
    cron.schedule('0 0 21 * * *', () => {
        transporter.sendMail(options)
        console.log("Mail send");
    });
};

main();