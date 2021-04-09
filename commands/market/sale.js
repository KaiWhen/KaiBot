const listing = require('./listing');
const { prefix, currency } = require('../../config.json');
const helper = require('../../helper');
const playerData = require('../../schemas/player-schema');
const marketData = require('../../schemas/market-schema');
const teamData = require('../../schemas/team-schema');

module.exports = {
    name: 'sale',
    description: 'Make a new auction sale',
    usage: '',
    execute(message, args) {
        if(!message.member.roles.cache.some(role => role.name === 'Technical') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
            return;

        const filter = m => m.content.includes(`${prefix}bid `) && !message.author.bot;
        const collector = message.channel.createMessageCollector(filter);
        const bidTimer = 1000 * 20;
        const bidTimer2 = 1000 * 10;
        const minIncrement = 50;
        const maxBid = 4250;
        const maxTeamSize = 2;
        let currentBid = 0;
        let currentBidString = '';
        let currentBidder;
        let teamSize = 0;
        let teamsFull;


        teamData.find({}, (err, teams) => {
            if(err) console.log(err);
            if(!teams) return;
            teamsFull = true;
            teams.forEach(teamm => {
                if(teamm.players.length < maxTeamSize)
                    teamsFull = false;
            });
            message.channel.send(teamsFull);
            if(teamsFull) {
                message.channel.send(teamsFull);
                marketData.findOneAndUpdate({ guildID: message.guild.id }, { auctionOn: false });
                return message.channel.send('**All teams are full. The auction is now over.**');
            }

            marketData.findOne({
                guildID: message.guild.id
            }, (err, market) => {
                if(err) console.log(err);
                if(!market) return message.reply('please create a market first.');

                if(!market.auctionOn)
                    return message.reply('please begin the auction first.');
                else if(market.saleOn)
                    return message.reply('a sale is already happening.');
                else if(market.listingCount == 0) {
                    market.auctionOn = false;
                    market.saleOn = false;
                    market.save();
                    return message.channel.send('**There are no players left on the market.\nThe auction is now over.**');
                }

                market.saleOn = true;
                market.save();
                const randomPlayerIndex = Math.floor(Math.random() * market.players.length);
                let playerID;
                if(market.players.length > 0) {
                    playerID = market.players[randomPlayerIndex];
                }
                else {
                    playerID = market.reoccurringPlayers[0];
                }

                playerData.findOne({
                    osuID: playerID,
                    guildID: message.guild.id
                }, (err, player) => {
                    if(err) console.log(err);

                    listing.newListing(message, playerID);

                    const interval = 1;
                    let counter = 20;
                    const countdownText = () => {
                        return `Sale ending in **${counter}s**`;
                    };
                    const updateCounter = () => {
                        if(counter > 0) {
                            if(counter <= 5 && counter != 4) message.channel.send(countdownText());
                            counter -= interval;
                            setTimeout(updateCounter, 1000 * interval);
                        }
                    };
                    updateCounter();

                    let auctionCountdown = setTimeout(() => {
                        collector.stop();
                    }, bidTimer);

                    collector.on('collect', m => {
                        const bid = Number(m.content.split(' ').splice(1));
                        teamData.findOne({ captainUserID: m.author.id }, (err, team) => {
                            if(err) console.log(err);
                            teamSize = team.players.length;
                            if(teamSize >= maxTeamSize)
                                m.reply('your team is full dont be greedy.');
                            else if(m.author.id == currentBidder) {
                                m.reply('you are already the highest bidder.');
                            }
                            else if(team.balance < bid) {
                                m.reply('you don\'t have enough money.');
                            }
                            else if(bid % 50 != 0) {
                                m.reply(`Please bid in increments of ${minIncrement}${currency}.`);
                            }
                            else if(!isNaN(bid) && (bid >= currentBid + minIncrement) && (bid <= maxBid)) {
                                m.react('✅');
                                currentBid = bid;
                                currentBidString = helper.numberWithCommas(currentBid);
                                currentBidder = m.author.id;
                                counter = 10;
                                clearTimeout(auctionCountdown);
                                auctionCountdown = setTimeout(()=> {
                                    collector.stop();
                                }, bidTimer2);
                            }
                            else if(bid > maxBid) {
                                m.reply(`**You cannot bid more than ${maxBid}${currency}**`);
                            }
                            else {
                                m.reply(`**the highest bid currently is ${currentBidString}${currency}. Please bid at least ${minIncrement}${currency} higher.**`);
                            }
                        });
                    });

                    collector.on('end', collected => {
                        console.log(`Collected ${collected.size} items`);

                        if(collected.size > 0 && currentBid > 0) {
                            teamData.findOne({
                                captainUserID: currentBidder,
                                guildID: message.guild.id
                            }, (err, team) => {
                                if(err) console.log(err);
                                if(!team) return message.channel.send('An error has occurred');

                                market.listingCount--;
                                market.saleOn = false;
                                team.balance -= currentBid;
                                team.players.push(player.osuUser);
                                let playerIndex = 0;
                                if(player.reoccurring) {
                                    playerIndex = market.reoccurringPlayers.indexOf(player.osuID);
                                    if(playerIndex > -1) market.reoccurringPlayers.splice(playerIndex, 1);
                                }
                                else {
                                    playerIndex = market.players.indexOf(player.osuID);
                                    if(playerIndex > -1) market.players.splice(playerIndex, 1);
                                }
                                player.teamName = team.teamName;
                                player.cost = currentBid;
                                player.isSold = true;
                                player.save();
                                market.save();
                                team.save();
                                message.channel.send(`**Sale ended. ${player.osuUser} has been sold for ${currentBidString}${currency} to ${team.teamName}.**`);

                                if(market.listingCount == 0) {
                                    market.auctionOn = false;
                                    market.saleOn = false;
                                    return message.channel.send('**There are no players left on the market.\nThe auction is now over.**');
                                }
                                return;
                            });
                        }
                        else {
                            market.saleOn = false;
                            if(!player.reoccurring) {
                                player.reoccurring = true;
                                market.reoccurringPlayers.push(player.osuID);
                                const playerIndex = market.players.indexOf(player.osuID);
                                if(playerIndex > -1) market.players.splice(playerIndex, 1);
                            }
                            else {
                                const playerIndex = market.reoccurringPlayers.indexOf(player.osuID);
                                if(playerIndex > -1) market.reoccurringPlayers.splice(playerIndex, 1);
                                market.listingCount--;
                            }
                            market.save();
                            player.save();
                            return message.channel.send(`**Sale ended. ${player.osuUser} has not been sold.**`);
                        }
                    });
                });
            });
        });
    }
};