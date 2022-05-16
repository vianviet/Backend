const express = require('express')
const uploadRouter = express.Router()
const multer = require("multer");
const path = require('path')
const { getDbInstance } = require('../db');
const { ObjectId } = require('mongodb')
const sharp = require('sharp');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        let error = null;
        if (!file.originalname.startsWith("NAPA")) {
            error = "Name must start with NAPA word";
        }
        cb(error ? new Error(error) : null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

// const maxSize = 1024 * 1024 * 2;
const maxSize = process.env.MAXSIZE;

const upload = multer({ storage: storage, limits: { fileSize: Number(maxSize) } })

uploadRouter.post("/", (req, res) => {
    try {
        const uploadFile = upload.single('NAPA');
        uploadFile(req, res, async err => {
            const file = req.file
            console.log(Number(maxSize))
            if (err) {
                res.status(400).send({ error: err.message })
                return;
            } else if (!file) {
                res.status(400).send({ error: "please upload file" })
                return;
            }
            const result = await (await getDbInstance())
                .collection("uploads")
                .insertOne(file);
            res.send({
                "normal": `http://localhost:3000/upload/normal/${result.insertedId}`,
                "resize": `http://localhost:3000/upload/resize/${result.insertedId}`,
            });
        })
    } catch (error) {
        res.json({ error: error.message });
    }
});

uploadRouter.get("/normal/:id", async(req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        let meta = await (await getDbInstance())
            .collection("uploads")
            .findOne({ _id: ObjectId(id) });
        const dir = `./uploads/${meta.filename}`;
        console.log(meta)
        res.download(dir, meta.originalname);
    } catch (error) {
        res.json({ error: error.message });
    }
});

uploadRouter.post("/multiplefile", (req, res) => {
    try {
        const uploadFile = upload.array("NAPA", 20)
        uploadFile(req, res, async err => {
            const file = req.files;
            if (err) {
                res.status(400).send({ error: err.message })
                return;
            } else if (!file) {
                const error = new Error("Please upload a file");
                error.httpStatusCode = 400;
                return;
            } else if (!file) {
                const error = new Error("Please upload a file");
                error.httpStatusCode = 400;
                return;
            }
            const result = await (await getDbInstance())
                .collection("uploads")
                .insertMany(file);
            console.log("result", result);
            res.send({ fileId: result.insertedIds });
        })
    } catch (error) {
        res.json({ error: error.message });
    }
});

uploadRouter.get("/resize/:id", async(req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        let meta = await (await getDbInstance()).collection("uploads").findOne({
            _id: new ObjectId(id),
        });
        console.log("meta", meta);
        const dir = `./uploads/${meta.filename}`;
        console.log("dir", dir);

        res.setHeader("Content-type", meta.mimetype);
        sharp(dir).resize(150, 150).pipe(res);
        res.header('Content-Disposition', 'attachment; filename="' + meta.filename + '"');

    } catch (error) {
        res.json({ error: error.message });
    }
});


module.exports = uploadRouter