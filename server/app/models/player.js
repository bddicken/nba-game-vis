var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlayerSchema   = new Schema({
    name: String,
    fullName: String,
    age: Number
});

module.exports = mongoose.model('Player', PlayerSchema);
