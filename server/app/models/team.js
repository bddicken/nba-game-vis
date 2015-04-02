var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TeamSchema   = new Schema({
    name: String,
    id: Number
});

module.exports = mongoose.model('Team', TeamSchema);
