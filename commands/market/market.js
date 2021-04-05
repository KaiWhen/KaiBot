const Discord = require('discord.js');
const marketData = require('../../schemas/market-schema');
const { orange } = require('../../config.json');

module.exports = {
    name: 'market',
    description: 'Market stuff',
    usage: '<create <name>/info>',
    execute(message, args) {
        const icon = message.guild.iconURL();

        if((args[0] == 'create')) {
            if(!message.member.roles.cache.some(role => role.name === 'Technical') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
                return;
            if(!args[1]) return message.channel.send('Please provide a name.');
            const name = message.content.split(' ').splice(2).join(' ');
            marketData.findOne({
                guildID: message.guild.id
            }, (err, market) => {
                if(err) console.log(err);
                if(!market) {
                    const newMarket = new marketData({
                        guildID: message.guild.id,
                        name: name,
                        listingCount: 0,
                        players: [],
                        reoccurringPlayers: [],
                        auctionOn: false,
                        saleOn: false
                    });
                    newMarket.save()
                    .then(result => console.log(result))
                    .catch(err => console.log(err));
                    return message.channel.send('Market created successfully.');
                } else {
                    return message.channel.send('A market has already been created in this server.');
                }
            });
        }

        if(args[0] == 'info') {
            const infoEmbed = new Discord.MessageEmbed();
            marketData.findOne({
                guildID: message.guild.id
            }, (err, market) => {
                if(err) console.log(err);
                if(!market) {
                    return message.channel.send('A market has not been created yet for this server. `.market create` to create one.');
                } else {
                    infoEmbed.setAuthor(`${market.name}`, icon);
                    infoEmbed.setDescription(`◈ **Listings:**: ${market.listingCount}\n◈ **Auction in Progress:** ${market.auctionOn}`);
                    infoEmbed.setColor(orange);
                    return message.channel.send(infoEmbed);
                }
            });
        }
    }
};