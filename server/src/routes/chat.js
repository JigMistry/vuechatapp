const router = require("express").Router();
const multer = require("multer");
const path = require("path");
var db = require("../database/db");
const fs = require("fs");
var sql;

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.resolve(__dirname, "../../storage/"));
    },
    filename: function (req, file, cb) {
        let fileExtension = file.mimetype.split("/");
        cb(null, Date.now()+'.'+fileExtension[1]);
    }
});
   
var upload = multer({ storage: storage });

router.post('/uploadmultiple', upload.array('file'), (req, res, next) => {
    const files = req.files;
    let identifier = "user"+req.body._to+":user"+req.body._from; // identifier
    sql = "INSERT INTO messages (_to, _from, identifier, message, type, attachment) VALUES (?, ?, ?, ?, ?, ?)";
    let count = 0;
    let messages = [];
    files.forEach(f => {
        db.run(sql, [
            req.body._to,
            req.body._from,
            identifier,
            req.body.message,
            req.body.type,
            f.filename
        ], (err) => {
            console.log(err);
            count += 1;
            if(!err) {
                messages.push({
                    _to: req.body._to,
                    _from: req.body._from,
                    message: "",
                    type: "attachment",
                    attachment: f.filename
                });
            }
            if(count == files.length) {
                res.status(200).send({
                    messages
                }); 
            }
        });
    });
});

router.post("/message", (req, res) => {
    sql = "INSERT INTO messages (_to, _from, identifier, message, type, attachment) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(sql, [
        req.body._to,
        req.body._from,
        req.body.identifier,
        req.body.message,
        req.body.type,
        req.body.attachment
    ], (err, rows) => {
        sql = "SELECT * FROM messages WHERE _to = ? AND _from= ? ORDER BY id DESC LIMIT 1";
        db.all(sql, [
            req.body._to,
            req.body._from
        ], (err, rows) => {
            if (err) {
                console.log("err", err);
                res.sendStatus(400);
            } else {
                console.log("result", rows);
                res.status(200).send({
                    message: rows[0]
                });
            }
        })
    });
})

router.get("/message/:myId/:otherId", (req, res) => {
    let c1 = "user"+req.params.myId+":user"+req.params.otherId;
    let c2 = "user"+req.params.otherId+":user"+req.params.myId;
    sql = "SELECT * FROM messages WHERE identifier IN (?, ?) AND is_deleted = 0";
    db.all(sql, [
        c1, c2
    ], (err, rows) => {
        if(err) {
            console.log("err", err);
            res.status(200).send({ messages: []});
            return;
        }
        console.log("rows", rows);
        res.status(200).send({ messages: rows});
    })
});

router.delete("/message/:messageId", (req, res) => {
    sql = "UPDATE messages SET is_deleted = 1 WHERE id = ?";
    db.run(sql, [req.params.messageId], (err, row) => {
        if(req.body.message.attachment) {
            try {
                fs.unlinkSync('storage/'+req.body.message.attachment);
            }
            catch(err) {
                console.log("err", err);
            }
        }
        res.sendStatus(200);
    });
});

module.exports = router;