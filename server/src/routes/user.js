const router = require("express").Router();
const jwt = require('jsonwebtoken');
var db = require("../database/db");


const JWT_SECRET = "ItsTopSecret";

const users = [{
    userId: 1,
    name: "Jignesh",
    username: "a@a.com",
    password: "123456"
},
{
    userId: 2,
    name: "Nikky",
    username: "b@b.com",
    password: "123456"
},
{
    userId: 3,
    name: "Kevin",
    username: "c@c.com",
    password: "123456"
}];

router.post("/login", (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).send({ message: "Username and Password are required"});
        return;
    }
    let foundUser = users.find((u) => (u.username === req.body.username) && (u.password === req.body.password));
    if (!foundUser) {
        res.status(400).send({ message: "Invalid username or password" });
        return;
    }
    let accessToken = jwt.sign({ userId: foundUser.userId, username: foundUser.username, name: foundUser.name }, JWT_SECRET);
    res.status(200).send({ message: "Login Successful", accessToken });
});


module.exports = router;