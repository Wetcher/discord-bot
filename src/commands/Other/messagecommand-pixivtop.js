const { Message, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const MessageCommand = require("../../structure/MessageCommand");
const fs = require('fs');
const Pixiv = require("@ibaraki-douji/pixivts");
const pixiv = new Pixiv.Pixiv();


module.exports = new MessageCommand({
    command: {
        name: 'pixivtop',
        description: 'Pixiv top!',
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
		const cookie = process.env.PIXIV_COOKIE;
		const agent = process.env.USER_AGENT;
		pixiv.staticLogin(cookie, agent);
		
		const mode = 'all';
		const illustTop = await pixiv.fetch(new URL(`https://www.pixiv.net/ajax/top/illust?mode=${mode}&lang=en`));
		const illustTopJson = JSON.parse(await illustTop.text());
		const itemsById = illustTopJson.body.thumbnails.illust.reduce((accumulator, item) => {accumulator[item['id']] = item; return accumulator}, [])
		
		
		const top5 = illustTopJson.body.page.ranking.items.slice(0, 5);
		const promises = [];
		
		const downloadImage = async (item) => {
			const id = item['id'];
			const url = item['urls']['1200x1200'];
			const fileName = id + ".jpg";
			
			if (!fs.existsSync(fileName)) {
				console.log('download');
				const resDow = await pixiv.download(new URL(url));
				fs.writeFileSync(id + ".jpg", resDow);
			}
			
			return fileName;
		}
		
		for (let index in top5) {
			const rankingItem = top5[index];
			const id = rankingItem ['id']
			const item = itemsById[id];
			
			promises.push(downloadImage(item));
		}
		
		const promisesRes = await Promise.all(promises);
		const files = promisesRes.map((x) => new AttachmentBuilder(x));
		// message.reply({ files: files });
		message.channel.send({ files: files });
    }
}).toJSON();