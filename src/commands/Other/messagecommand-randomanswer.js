const { Message } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const MessageCommand = require("../../structure/MessageCommand");

module.exports = new MessageCommand({
    command: {
        name: 'randomanswer',
        description: 'Randomly answers!',
        aliases: [],
        permissions: ['SendMessages']
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {Message} message 
     * @param {string[]} args
     */
    run: async (client, message, args) => {
		const randValue = Math.floor(Math.random() * 1000);
		console.log(randValue);
		if (randValue <= 1) {
			await message.reply({
				content: '**Пидора ответ!** '
			});
		}
    }
}).toJSON();