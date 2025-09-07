const { Message, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const MessageCommand = require("../../structure/MessageCommand");
const fs = require('fs');
const Pixiv = require("@ibaraki-douji/pixivts");
const pixiv = new Pixiv.Pixiv();
const { warn, error, info, success } = require("../../utils/Console");


module.exports = new MessageCommand({
    command: {
        name: 'pixivranking',
        description: 'Pixiv ranking!',
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
		try {
			const downloadImage = async (item) => {
				const id = item['illust_id'];
				const fileName = id + ".jpg";
				
				const images = await pixiv.getIllustByID(id);
				const url = images.urls[0].regular;
				
				if (!fs.existsSync(fileName)) {
					console.log('download');
					const resDow = await pixiv.download(new URL(url));
					fs.writeFileSync(id + ".jpg", resDow);
				}
				
				return fileName;
			}
			
			const streamToJson = async (stream) => {
				const chunks = [];

				for await (const chunk of stream) {
					chunks.push(chunk);
				}

				const jsonString = Buffer.concat(chunks).toString('utf8');
				return JSON.parse(jsonString);
			}
			
			const Pixiv = require("@ibaraki-douji/pixivts");
			const pixiv = new Pixiv.Pixiv();
			const fs = require('fs');
			
			const cookie = process.env.PIXIV_COOKIE;
			const agent = process.env.USER_AGENT;
			pixiv.staticLogin(cookie, agent);
			
			const mode = args[0] || 'daily';
			const illustTop = await pixiv.fetch(new URL(`https://www.pixiv.net/ranking.php?format=json&mode=${mode}&content=illust&p=1`));
			const json = await streamToJson(illustTop.body);
			
			const promises = [];
			const urlImages = [];
			const top5 = json.contents.slice(0, 5);
			
			for (let index in top5) {
				const rankingItem = top5[index];
				urlImages.push('<https://www.pixiv.net/en/artworks/' + rankingItem['illust_id'] + '>');
				
				promises.push(downloadImage(rankingItem));
			}
			
			const promisesRes = await Promise.all(promises);
			const files = promisesRes.map((x) => new AttachmentBuilder(x))
			// message.reply({ files: files });
			message.channel.send({ content: urlImages.join('\n'), files: files });
		} catch(e) {
			error('Error requesting files for message command: ' + JSON.stringify(e));
			message.channel.send({ content: 'Error requesting files for message command: ' + JSON.stringify(e) });
		}
    }
}).toJSON();