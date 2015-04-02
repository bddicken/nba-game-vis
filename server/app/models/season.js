var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SeasonSchema   = new Schema({
    name: String,
    id: Number
});

module.exports = mongoose.model('Season', SeasonSchema);
