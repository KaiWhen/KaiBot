const mongoose = require('mongoose');

const marketSchema = mongoose.Schema({
    guildID: String,
    name: String,
    listingCount: Number,
    players: [String],
    reoccurringPlayers: [String],
    auctionOn: Boolean,
    saleOn: Boolean
});

module.exports = mongoose.model('market', marketSchema);