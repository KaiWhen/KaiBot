const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    userID: String,
    guildID: String,
    osuUser: String,
    osuID: String,
    teamName: String,
    cost: Number,
    isCaptain: Boolean,
    isSold: Boolean,
    reoccurring: Boolean
});

module.exports = mongoose.model('player', playerSchema);