const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');
const teamData = require('../../schemas/team-schema');

module.exports = {
    name: 'remove',
    description: 'Remove a player/captain from the market',
    usage: '<player/captain> <osu user>',
    execute(message, args) {
        if(!message.member.roles.cache.some(role => role.name === 'Technical') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
            return;

        if(args[0] == 'player') {
            const playerName = message.content.split(' ').splice(2).join(' ');
            if(!playerName)
                return message.reply('please provide the player\'s osu! user.');
            marketData.findOne({
                guildID: message.guild.id
            }, (err, market) => {
                if(err) console.log(err);
                if(!market) return message.reply('please create a market first.');

                playerData.findOneAndDelete({
                    osuUser: playerName,
                    guildID: message.guild.id
                }, (err, player) => {
                    if(err) console.log(err);
                    if(!player) {
                        return message.channel.send('This player does not exist.');
                    }
                    if(args[0] == 'player') {
                        if(!player.isSold) market.listingCount -= 1;
                        const playerIndex = market.players.indexOf(player.osuID);
                        if(playerIndex > -1) market.players.splice(playerIndex, 1);
                        market.save();

                        teamData.findOne({
                            teamName: player.teamName,
                            guildID: message.guild.id
                        }, (err, team) => {
                            if(err) console.log(err);
                            if(!team) return;
                            const playerTeamIndex = team.players.indexOf(playerName);
                            if(playerTeamIndex > -1) team.players.splice(playerTeamIndex, 1);
                            team.save();
                        });
                    }
                    return message.channel.send('Player removed successfully.');
                });
            });
        }
        else if(args[0] == 'captain') {
            const playerName = message.content.split(' ').splice(2).join(' ');
            if(!playerName)
                return message.reply('please provide the player\'s osu! user.');
            marketData.findOne({
                guildID: message.guild.id
            }, (err, market) => {
                if(err) console.log(err);
                if(!market) return message.reply('please create a market first.');

                playerData.findOneAndDelete({
                    osuUser: playerName,
                    guildID: message.guild.id
                }, (err, player) => {
                    if(err) console.log(err);
                    if(!player) {
                        return message.channel.send('This player does not exist.');
                    }
                        teamData.findOneAndDelete({
                            captainName: playerName,
                            guildID: message.guild.id
                        }, (err, team) => {
                            if(err) console.log(err);
                            if(!team) return;
                        });
                    return message.channel.send('Captain removed successfully.');
                });
            });
        }
    }
};