var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SummarySchema   = new Schema({
    player: String,
    team: String,
    season: String,
    minutes: [{}],
});

module.exports = mongoose.model('Summary', SummarySchema);
