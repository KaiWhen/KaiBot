const marketData = require('../../schemas/market-schema');
const { prefix } = require('../../config.json');

module.exports = {
    name: 'auction',
    description: 'Begin or end an auction',
    usage: '<start/end>',
    execute(message, args) {
        if(!message.member.roles.cache.some(role => role.name === 'Technical') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
            return;

        marketData.findOne({
            guildID: message.guild.id
        }, (err, market) => {
            if(err) console.log(err);
            if(!market) return message.reply('please create a market first.');

            if(args[0] == 'start') {
                market.auctionOn = true;
                market.save();
                return message.channel.send(`**Auction has begun. Use the ${prefix}sale command to start auctioning players!**`);
            }
            else if(args[0] == 'end') {
                market.auctionOn = false;
                market.saleOn = false;
                market.save();
                return message.channel.send('**Auction has ended.**');
            }
        });
    }
};