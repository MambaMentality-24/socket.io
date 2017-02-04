let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/chat');
let MessageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createAt: {type: Date, default: Date.now}
});
exports.Message = mongoose.model('Message', MessageSchema);