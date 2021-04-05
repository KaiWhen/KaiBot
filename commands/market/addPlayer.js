const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');
const teamData = require('../../schemas/team-schema');
const nodeosu = require('node-osu');
const osu = new nodeosu.Api(process.env.OSU_API, {
	notFoundAsError: true,
	completeScores: true,
	parseNumeric: true
});

module.exports = {
    name: 'add',
    description: 'Add a player to the market or add a captain',
    usage: '<player/captain> <osu id> <discord id>',
    execute(message, args) {
        if(!message.member.roles.cache.some(role => role.name === 'Technical') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
            return;

        const discordID = args[2];
        const playerID = args[1];
        if(!playerID || !discordID)
            return message.reply('please provide the player\'s osu! id followed by their discord id.');

        let playerName;
        osu.getUser({ u: playerID }).then(user => {
            if(!user) return message.channel.send(`There is no player with the id ${playerID}`);
            playerName = user.name;

            if(args[0] == 'player') {
                marketData.findOne({
                    guildID: message.guild.id
                }, (err, market) => {
                    if(err) console.log(err);
                    if(!market) return message.reply('please create a market first.');

                    playerData.findOne({
                        osuUser: playerName
                    }, (err, player) => {
                        if(err) console.log(err);
                        if(!player) {
                            const newPlayer = new playerData({
                                userID: discordID,
                                guildID: message.guild.id,
                                osuUser: playerName,
                                osuID: playerID,
                                teamName: '',
                                cost: 0,
                                isSold: false,
                                reoccurring: false
                            });
                            newPlayer.save()
                            .then(result => console.log(result))
                            .catch(err => console.log(err));
                            market.listingCount = market.players.push(playerID);
                            market.save();
                            return message.channel.send(`Player ${playerName} added successfully.`);
                        } else {
                            return message.channel.send('This player already exists.');
                        }
                    });
                });
            }
            else if(args[0] == 'captain') {
                marketData.findOne({
                    guildID: message.guild.id
                }, (err, market) => {
                    if(err) console.log(err);
                    if(!market) return message.reply('please create a market first.');

                    const teamName = 'Team ' + playerName;
                    playerData.findOne({
                        osuUser: playerName
                    }, (err, player) => {
                        if(err) console.log(err);
                        if(!player) {
                            const newPlayer = new playerData({
                                userID: discordID,
                                guildID: message.guild.id,
                                osuUser: playerName,
                                osuID: playerID,
                                teamName: teamName,
                                isCaptain: true
                            });
                            newPlayer.save()
                            .then(result => console.log(result))
                            .catch(err => console.log(err));
                        } else {
                            return message.channel.send('This player already exists.');
                        }
                    });

                    teamData.findOne({
                        captainName: playerName
                    }, (err, team) => {
                        if(err) console.log(err);
                        if(!team) {
                            const newTeam = new teamData({
                                captainUserID: discordID,
                                guildID: message.guild.id,
                                captainName: playerName,
                                teamName: teamName,
                                teamIcon: '',
                                players: [],
                                balance: 5000
                            });
                            newTeam.save()
                            .then(result => console.log(result))
                            .catch(err => console.log(err));
                            return message.channel.send('Captain added and team created successfully.');
                        } else {
                            return message.channel.send('This player already exists.');
                        }
                    });
                });
            }
        });
    }
};