var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlayerSchema   = new Schema({
    name: String,
    age: Number
});

module.exports = mongoose.model('Player', PlayerSchema);
