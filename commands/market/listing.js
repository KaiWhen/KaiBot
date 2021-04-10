const Discord = require('discord.js');
const { orange, currency } = require('../../config.json');
const helper = require('../../helper');
const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');
const nodeosu = require('node-osu');
const osu = new nodeosu.Api(process.env.OSU_API, {
	notFoundAsError: true,
	completeScores: true,
	parseNumeric: true
});

const newListing = (message, playerID) => {
    const listingEmbed = new Discord.MessageEmbed();

    marketData.findOne({
        guildID: message.guild.id
    }, (err, market) => {
        if(err) console.log(err);
        if(!market) return message.reply('please create a market first.');

        playerData.findOne({
            osuID: playerID,
            guildID: message.guild.id
        }, (err, player) => {
            if(err) console.log(err);
            if(!player) {
                return message.channel.send('This player does not exist or has already been bought.');
            }
            osu.getUser({ u: playerID }).then(user => {
                if(!user) return message.channel.send('This player does not exist.');
                const flag = 'https://www.countryflags.io/' + user.country + '/flat/64.png';
                const userIcon = 'https://a.ppy.sh/' + user.id;
                const rank = helper.numberWithCommas(user.pp.rank);
                const playcount = helper.numberWithCommas(user.counts.plays);
                const serverIcon = message.guild.iconURL();

                listingEmbed.setColor(orange)
                .setAuthor(`osu! Standard Profile for ${user.name}`, flag)
                .setThumbnail(userIcon)
                .setDescription(`◈ **Rank:** #${rank}\n◈ **Country Rank:** #${user.pp.countryRank}\n◈ **Level:** ${user.level}\n◈ **PP:** ${user.pp.raw}\n◈ **Accuracy:** ${user.accuracy.toFixed(2)}%\n◈ **Playcount:** ${playcount}`)
                .setFooter(market.name, serverIcon);
                return message.channel.send(`**${(player.reoccurring) ? 'Reoccurring' : 'New'} Farmer's Market Sale: ${user.name}, starting at *0${currency}***`)
                .then(message.channel.send(listingEmbed));
            });
        });
    });
};

module.exports = {
    newListing
};