const express = require("express");
const bodyParser = require('body-parser');

const { onSocketInitiate } = require("./src/socket");


const app = express();
const http = require("http").createServer(app);

const userRoutes = require("./src/routes/user");
const chatRoutes = require("./src/routes/chat");

app.use(bodyParser.json());

app.use(express.static("storage"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use("/chat", chatRoutes);
app.use("/", userRoutes);


http.listen(3000, () => {
    console.log("app started here on port 3000");
    onSocketInitiate(http);
});