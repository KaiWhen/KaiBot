const Discord = require('discord.js');
const { prefix } = require('./config.json');
const fs = require('fs');
const path = require('path');
const client = new Discord.Client({ autoReconnect: true });
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

const mongo = require('./mongo.js');
const connectToMongoDB = async () => {
    await mongo().then((mongoose) => {
        try {
            console.log('Connected to MongoDB');
        } finally {
            mongoose.connection.close;
        }
    });
};
connectToMongoDB();

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.on('ready', async () => {
    console.log(`${client.user.username} is running`);
    client.user.setActivity('ICCT3: Farmer\'s Market');
  });

client.on('message', async message => {

    if(message.author.type === 'dm') return;

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('You don\'t have permission to use this command!');
        }
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\n**Usage:** \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
	}

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command.');
    }
});

client.login(process.env.BOT_TOKEN);