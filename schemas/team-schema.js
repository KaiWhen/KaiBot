const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    captainUserID: String,
    guildID: String,
    captainName: String,
    teamName: String,
    teamIcon: String,
    players: [String],
    balance: Number
});

module.exports = mongoose.model('team', teamSchema);