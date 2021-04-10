const Discord = require('discord.js');
const { orange, currency } = require('../../config.json');
const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');

module.exports = {
    name: 'costs',
    description: 'Cost of each player bought in the auction',
    usage: '',
    execute(message, args) {
        const costEmbed = new Discord.MessageEmbed()
        .setColor(orange);
        const costs = [];
        let costString = '';
        const serverIcon = message.guild.iconURL();

        marketData.findOne({ guildID: message.guild.id }, (err, market) => {
            if(err) console.log(err);
            if(!market) return;

            playerData.find({ guildID: message.guild.id }, (err, players) => {
                if(err) console.log(err);
                if(!players) return;
                players.forEach(player => {
                    if(player.cost > 0) {
                        costs.push({ name: player.osuUser, cost: player.cost });
                    }
                });
                costs.sort((a, b) => parseInt(b.cost) - parseInt(a.cost));
                costs.forEach(cost => {
                    costString += `**${cost.name}:** ${cost.cost}${currency}\n`;
                });
                costEmbed.setAuthor('Player Costs', serverIcon)
                .setDescription(costString);
                return message.channel.send(costEmbed);
            });
        });
    }
};