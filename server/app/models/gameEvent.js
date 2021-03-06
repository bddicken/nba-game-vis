var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GameEventSchema   = new Schema({
    season: String,
    team: String,
    player: String,
    playerID: {type: String, ref: 'Player'},
    gameID: String,
    secondsIntoGame: Number,
    eventType: String,
    eventDetail: String
});

module.exports = mongoose.model('GameEvent', GameEventSchema);
