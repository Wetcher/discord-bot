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
		const cookie = 'first_visit_datetime_pc=2024-09-05%2003%3A22%3A39; p_ab_id=3; p_ab_id_2=3; p_ab_d_id=1079103727; yuid_b=N1VlFGg; privacy_policy_agreement=7; privacy_policy_notification=0; a_type=0; b_type=1; login_ever=yes; PHPSESSID=27052407_hSKfs3XbFfaRINBzzhzwlDTYHD5CqQuE; c_type=29; cf_clearance=vz2IQbg7JlD0wp.xyamgWkMU7QdNv2p_IMmGcO9QAY4-1755957042-1.2.1.1-I_de3VJEwHr.fesrsSFJIl5Ld.1MTIJWVZ5bZuwBy1NdT5AWV8LRKGEsOQTFrA_pz5GhTCWART7t.PJtEDhaTX33iESFMAzoQpNMXtoUuAs3vGGlZyRBDzD2MavUWCUx9H.iVy0fUYx4yrNqgHcKtJ0AhSsbBPZIyRs7ZnSOOStbUoZuEDH4d.AshUN.im9oIbnTJaJH5ONg9_KU7yO19F5Z5z2c2523rKpsteuqWNo; __cf_bm=EYVPNvD0m_Wu2Jm7ukfKYNR_cIzSPpAJbqcAvtBNcUg-1757241047-1.0.1.1-EuvJO1e3puW5ZDWDKKFeZ.ySq5rQpIJwKUcWXET0am1s1oPX4weMvco_prV4aPM9p25KBKk3YOtqJv2nwGLz39A5GuYWToMTVvvntiwu0RHVvYnuSWZ1X7cWPSHkfKnI; _cfuvid=ojfGtE49WlzcOjik5qdfp0Ynuqx52YSEygKyASi5zM0-1757241047455-0.0.1.1-604800000';
		const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';
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