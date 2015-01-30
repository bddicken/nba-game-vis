var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GameEventSchema   = new Schema({
    season: String,
    team: String,
    player: String,
    playerID: {type: Number, ref: 'Player'},
    gameID: String,
    eventType: String,
    eventDetail: String
});

module.exports = mongoose.model('GameEvent', GameEventSchema);
