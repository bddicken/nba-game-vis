var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GameSchema   = new Schema({
    name: String,
    season: String,
    homeTeam: String,
    awayTeam: String,
    date: String,
    id: Number,
});

module.exports = mongoose.model('Game', GameSchema);
