const { ChatInputCommandInteraction, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const Pixiv = require("@ibaraki-douji/pixivts");
const pixiv = new Pixiv.Pixiv();
const { warn, error, info, success } = require("../../utils/Console");

module.exports = new ApplicationCommand({
    command: {
        name: 'pixivranking',
        description: 'Pixiv ranking interaction.',
        type: 1,
        options: [{
            name: 'option',
            description: 'Select one of the options!',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }]
    },
    options: {
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
		await interaction.deferReply();
		try {
			const downloadImage = async (item, spoiler) => {
				const id = item['illust_id'];
				const fileName = id + ".jpg";
				
				const images = await pixiv.getIllustByID(id);
				const url = images.urls[0].regular;
				
				if (!fs.existsSync(fileName)) {
					console.log('download');
					const resDow = await pixiv.download(new URL(url));
					fs.writeFileSync(id + ".jpg", resDow);
				}
				
				return {image: fileName, name: fileName, spoiler: spoiler};
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
			
			const cookie = 'first_visit_datetime_pc=2024-09-05%2003%3A22%3A39; p_ab_id=3; p_ab_id_2=3; p_ab_d_id=1079103727; yuid_b=N1VlFGg; privacy_policy_agreement=7; privacy_policy_notification=0; a_type=0; b_type=1; login_ever=yes; PHPSESSID=27052407_hSKfs3XbFfaRINBzzhzwlDTYHD5CqQuE; c_type=29; cf_clearance=vz2IQbg7JlD0wp.xyamgWkMU7QdNv2p_IMmGcO9QAY4-1755957042-1.2.1.1-I_de3VJEwHr.fesrsSFJIl5Ld.1MTIJWVZ5bZuwBy1NdT5AWV8LRKGEsOQTFrA_pz5GhTCWART7t.PJtEDhaTX33iESFMAzoQpNMXtoUuAs3vGGlZyRBDzD2MavUWCUx9H.iVy0fUYx4yrNqgHcKtJ0AhSsbBPZIyRs7ZnSOOStbUoZuEDH4d.AshUN.im9oIbnTJaJH5ONg9_KU7yO19F5Z5z2c2523rKpsteuqWNo; __cf_bm=EYVPNvD0m_Wu2Jm7ukfKYNR_cIzSPpAJbqcAvtBNcUg-1757241047-1.0.1.1-EuvJO1e3puW5ZDWDKKFeZ.ySq5rQpIJwKUcWXET0am1s1oPX4weMvco_prV4aPM9p25KBKk3YOtqJv2nwGLz39A5GuYWToMTVvvntiwu0RHVvYnuSWZ1X7cWPSHkfKnI; _cfuvid=ojfGtE49WlzcOjik5qdfp0Ynuqx52YSEygKyASi5zM0-1757241047455-0.0.1.1-604800000';
			const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';
			pixiv.staticLogin(cookie, agent);
			
			const mode = interaction.options.getString('option', true) || 'daily';
			const illustTop = await pixiv.fetch(new URL(`https://www.pixiv.net/ranking.php?format=json&mode=${mode}&content=illust&p=1`));
			const json = await streamToJson(illustTop.body);
			
			const promises = [];
			const urlImages = [];
			const top5 = json.contents.slice(0, 5);
			
			for (let index in top5) {
				const rankingItem = top5[index];
				urlImages.push('<https://www.pixiv.net/en/artworks/' + rankingItem['illust_id'] + '>');
				
				promises.push(downloadImage(rankingItem, mode.endsWith('r18')));
			}
			
			const promisesRes = await Promise.all(promises);
			const files = promisesRes.map((x) => { const attachment = new AttachmentBuilder(x.image, {name: x.name }); attachment.setSpoiler(x.spoiler); return attachment; });
			interaction.editReply({ content: urlImages.join('\n'), files: files });
		} catch (e) {
			error('Error requesting files for slash command: ' + JSON.stringify(e));
			interaction.editReply({ content: 'Error requesting files for message command: ' + JSON.stringify(e) });
		}
    }
}).toJSON();