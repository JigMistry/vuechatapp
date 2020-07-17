const socketIO = require("socket.io");

var io;
var chatNamespace;



module.exports = {
    onSocketInitiate(http) {
        console.log("socket initialized");
        io = socketIO(http);
        
        chatNamespace = io.of('/chat');

        function emitOnlineUsers(chatNamespace, socket, body) {
            let allUsers = [];
            Object.keys(chatNamespace.connected).forEach(key => {
                if(chatNamespace.connected[key].userId != body.from && !!chatNamespace.connected[key].userId) {
                    if(!allUsers.find(u => u.id == chatNamespace.connected[key].userId)){
                        allUsers.push({
                            name: chatNamespace.connected[key].userName,
                            id: chatNamespace.connected[key].userId
                        });
                    } 
                }
            });
            socket.emit('online-users', {
                users: allUsers
            });
        }

        chatNamespace.on('connection', (socket) => {
            console.log('user connected');
            socket.on('user-connected', (body) => {
                // room here is user Id
                socket.userName = body.name;
                socket.userId = body.userId;
                socket.join(body.userId);
                emitOnlineUsers(chatNamespace, socket, {from: body.userId});
            });
            
            socket.on('user-disconnected', (body) => {
                console.log("called here disconnected", body);
                socket.leaveAll();
                socket.disconnect();
            });

            socket.on('disconnect', () => {
                console.log("Auto Disconnect called");
            });

            socket.on('send-message', (body) => {
                socket.to(body._to.toString()).emit('on-new-message', body);
            });

            socket.on('typing-start', (body) => {
                socket.to(body._to.toString()).emit('typing-start');
            });

            socket.on('typing-end', (body) => {
                socket.to(body._to.toString()).emit('typing-end');
            });
            
            socket.on('find-online-users', (body) => {
                emitOnlineUsers(chatNamespace, socket, body);
            });

            socket.on('delete-message', (body) => {
                socket.to(body.to.toString()).emit('message-deleted', body.messageId);
            });

            socket.on('user-disconnected', socket.leave);

        });
    }
}