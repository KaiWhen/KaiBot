const teamData = require('../../schemas/team-schema');
const { currency } = require('../../config.json');
const helper = require('../../helper');

module.exports = {
    name: 'balance',
    description: 'Check your balance',
    usage: 'add \'all\' to see balance from each team',
    execute(message, args) {
        if(!message.member.roles.cache.some(role => role.name === 'Captain') && (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')))
            return;

        let balanceMessage = '';
        let balance = '';
        if(args[0] == 'all') {
            teamData.find({}, (err, teams) => {
                if(err) console.log(err);
                if(!teams) return;
                teams.forEach((team) => {
                    balance = helper.numberWithCommas(team.balance);
                    balanceMessage += `**${team.teamName}:** ${balance}${currency}\n`;
                });
                return message.channel.send(balanceMessage);
            });
        }
        else if(args[0] == 'reset') {
            if(!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')) return;
            teamData.find({}, (err, teams) => {
                if(err) console.log(err);
                if(!teams) return;
                teams.forEach((team) => {
                    team.balance = 5000;
                    team.save();
                });
                return message.channel.send('Balances have been reset.');
            });
        }
        else if(!args[0]) {
            teamData.findOne({
                captainUserID: message.author.id,
                guildID: message.guild.id
            }, (err, team) => {
                if(err) console.log(err);
                if(!team) return message.reply('saoieunhgousaeg');
                balance = helper.numberWithCommas(team.balance);
                balanceMessage += `**${team.teamName}:**\n**Balance:** ${balance}${currency}`;
                return message.channel.send(balanceMessage);
            });
        }
    }
};