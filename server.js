let express = require('express');
let path = require('path');
let Message = require('./model').Message;
let app = express();
app.use(express.static(__dirname));
let server = require('http').createServer(app);
app.get('/', function (req, res) {
    res.sendFile(path.resolve('chat.html'));
});
let io = require('socket.io')(server);
let sockets = {};
io.on('connection', function (socket) {
    let username;
    let rootName = 'publicChat';  //默认进入大厅房间进行聊天；
    socket.join(rootName); // 客户端进入大厅房间
    socket.on('message', function (msg) {
        let msgReg = /^@([^ ]+) (.+)/;
        let result = msg.match(msgReg);
        if (result) { //代表私聊
            let toUser = result[1];
            let content = result[2];
            sockets[toUser] && sockets[toUser].send({username, content: `@${toUser} ${content}`});
            socket.send({username, content: msg});
        } else { //代表公聊
            if (username) {
                //私聊或者进房间里聊天都是建立在有用户名的基础之上进行聊天的；
                Message.create({username, content: msg}, function (err, doc) {
                    if (err) {
                        socket.send({username: '系统', content: '信息保存出错'});
                    } else {
                        if (rootName) {
                            io.in(rootName).emit('message', doc);  //进入到指定的房间进行广播
                        } else {
                            // // io.emit('message', doc);
                            // io.in('publicChat').emit('message', doc);
                        }
                    }
                });
            } else {
                username = msg;
                sockets[username] = socket; //将每个客户端的socket对象保存起来，以便进行端对端的聊天
                // io.emit('message', {username: '系统', content: `欢迎${username}的光临。`});
                // 第一次属于是在大厅房间进行欢迎新用户的进入
                io.in(rootName).emit('message', {username: '系统', content: `欢迎${username}的光临。`});
            }
        }
    });
    socket.on('getAllMessages', function () {
        Message.find({}, function (err, messages) {
            if (err) {

            } else {
                //这里可以算是客户端第一次进来的位置；
                socket.emit('allMessage', messages);
                // socket.send({username: '系统', content: '请输入昵称'});
                // 像指定的客户端对象进行发送信息
                socket.emit('message', {username: '系统', content: '请输入昵称'});
            }
        });
    });
    socket.on('join', function (name) {
        // if (name == null) {
        //     socket.leave(rootName);
        //     rootName = null;
        //     return;
        // }
        if (rootName) {
            socket.leave(rootName);
        }
        socket.join(name);
        rootName = name;
    });
});
server.listen(8080, console.log('8080 port is running'));