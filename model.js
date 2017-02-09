let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat');
let MessageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createAt: {type: Date, default: Date.now}
});
exports.Message = mongoose.model('Message', MessageSchema);
