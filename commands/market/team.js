const Discord = require('discord.js');
const { prefix, orange } = require('../../config.json');
const teamData = require('../../schemas/team-schema');
const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');

module.exports = {
    name: 'team',
    description: 'View your team',
    usage: '<all/@captain/name <team name>/set <icon URL>>',
    execute(message, args) {
        const teamEmbed = new Discord.MessageEmbed()
        .setColor(orange);
        const serverIcon = message.guild.iconURL();

        marketData.findOne({ guildID: message.guild.id }, (err, market) => {
            if(err) console.log(err);
            if(!market) message.channel.send('A market has not been created yet for this server. `.market create <name>` to create one.');
            if(args[0] == 'all') {
                teamData.find({}, (err, teams) => {
                    if(err) console.log(err);
                    if(!teams) return;
                    teamEmbed.setTitle(`Teams for ${market.name}`)
                    .setThumbnail(serverIcon);
                    teams.forEach(team => {
                        teamEmbed.addField(`${team.teamName}`, `${team.captainName} (c)\n${team.players.join('\n')}`, true);
                    });
                    return message.channel.send(teamEmbed);
                });
            }
            else if(args[0] == 'name') {
                if(!message.member.roles.cache.some(role => role.name === 'Captain')) return;
                let name = '';
                if(args[1]) name = message.content.split(' ').splice(2).join(' ');
                teamData.findOne({ captainUserID: message.author.id }, (err, team) => {
                    if(err) console.log(err);
                    if(!team) return;
                    if(!args[1]) return message.channel.send(`Your team name is '${team.teamName}'. Use \`${prefix}team name <name>\` to change your team name.`);
                    team.teamName = name;
                    playerData.findOne({ userID: message.author.id }, (err, player) => {
                        if(err) console.log(err);
                        if(!player) message.channel.send('And error has occurred.');
                        player.teamName = name;
                        player.save();
                    });
                    team.players.forEach(playerName => {
                        playerData.findOne({ osuUser: playerName }, (err, player) => {
                            if(err) console.log(err);
                            player.teamName = name;
                            player.save();
                        });
                    });
                    team.save();
                    return message.channel.send(`Your team name has been changed to '${name}'`);
                });
            }
            else if(args[0] == 'icon') {
                if(!message.member.roles.cache.some(role => role.name === 'Captain')) return;
                if(!args[1]) return message.reply('please provide an image URL.');
                const iconURL = message.content.split(' ').splice(2).join(' ');
                teamData.findOne({ captainUserID: message.author.id }, (err, team) => {
                    if(err) console.log(err);
                    if(!team) return;
                    team.teamIcon = iconURL;
                    team.save();
                    return message.channel.send('Your team icon has been set.');
                });
            }
            else {
                let userID;
                if(message.mentions.members.first()) userID = message.mentions.members.first().id;
                else userID = message.author.id;
                playerData.findOne({ userID: userID }, (err, player) => {
                    if(err) console.log(err);
                    if(!player) return;
                    teamData.findOne({ teamName: player.teamName }, (err, team) => {
                        if(err) console.log(err);
                        if(!team) return message.channel.send('An error has occurred');
                        teamEmbed.setAuthor(`${team.teamName}`)
                        .setThumbnail(team.teamIcon)
                        .setDescription(`${team.captainName} (c)\n${team.players.join('\n')}`)
                        .setFooter(market.name, serverIcon);
                        return message.channel.send(teamEmbed);
                    });
                });
            }
        });
    }
};