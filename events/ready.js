const { Events } = require('discord.js');
const readline = require('readline');
const fs = require('fs');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		let msgAuthor, msgChannel;

		let serverMap = new Map();
		const imMatch1 = /\b(i['\u2019]m )(.+)/i;
		const imMatch2 = /\b(im )(.+)/i;
		const imMatch3 = /\b(i am )(.+)/i;
		const youreMatch1 = /\b(youre )(.+)/i;
		const youreMatch2 = /\b(you['\u2019]re )(.+)/i;
		const youreMatch3 = /\b(ur )(.+)/i;
		const youreMatch4 = /\b(u r )(.+)/i;
		const youreMatch5 = /\b(you are )(.+)/i;

		const excludeFilePath = 'exclude.txt';
		const excludes = [];

		// list for users who wish to be excluded
		if (fs.existsSync(excludeFilePath)) {
			const rl = readline.createInterface({
				input: fs.createReadStream('exclude.txt')
			});
			rl.on('line', (user) => {
				console.log(`Added ${user} to exclude list`)
				excludes.push(user);
			})
		}
		else {
			console.log("exclude.txt doesn't exist in the root directory - consider making one if anyone doesn't want to be affected!");
		}

		let youreMatches = [youreMatch1, youreMatch2, youreMatch3, youreMatch4, youreMatch5];
		let imMatches = [imMatch1, imMatch2, imMatch3];

		const guilds = await client.guilds.fetch();	// servers this great bot is in
		guilds.forEach(g => {
			serverMap.set(g.id, [[], []]); 								// the array will contain info (SpeakingOrder & ChannelOrder)
		});

		client.on('messageCreate', async (message) => {
			try {
				let youre = false;

				msgGuild = await client.guilds.cache.get(message.guildId); 		// server that the message got sent in
				msgAuthor = await message.member; 								// who wrote the message?
	
				if (msgAuthor == client.user.id) { // this shouldn't happen but anyways
					return;
				}

				let nick = "";
				msg = await message.content;

				let guildInfo = serverMap.get(msgGuild.id);
				let speakingOrder = guildInfo[0];
				let channelOrder = guildInfo[1];

				// everything beyond this point should be handled per-server now

				message

				if (speakingOrder[0] != msgAuthor) { // new person speaking (moshi moshi?)
					speakingOrder.unshift(msgAuthor);
					channelOrder.unshift(message.channelId);
					guildInfo[0] = speakingOrder.slice(0,2);
					guildInfo[1] = channelOrder.slice(0,2);
					serverMap.set(msgGuild.id, guildInfo); 		// set the new info on the map
				}

				// reply check
				if (message.reference) {
					let nick = "";
					const repliedmsg = await message.fetchReference();
					const target = await msgGuild.members.cache.get(repliedmsg.author.id);

					for (const ym of youreMatches) {
						if (msg.match(ym)) {
							nick = await msg.match(ym)[2].slice(0,32);
						}
					}

					if (target && excludes.includes(target.user.username)) {
						console.log(`BLOCKED - ${target.user.username} is in exclude.txt: ${message.content}`);
					}
					else if (nick && target) {
						await target.setNickname(nick)
							.then(console.log(`${msgGuild.name} -- ${msgAuthor.user.username} changed ${target.user.username}'s nickname to "${nick}": "${message.content}"`))
							.catch ((err) => {
								if (err) {
									console.log("Yeah this pseron is cool... (owner shield block)");
								}
							});
					}
				}
				else {
					// want to make the first person who spoke change the name of the second
					for (const ym of youreMatches) {
						if (msg.match(ym)) {
							nick = await msg.match(ym)[2].slice(0,32);
							youre = true;
						}
					}

					if (speakingOrder[0] && speakingOrder[1] && nick && youre && (channelOrder[0] === channelOrder[1])) {
						if (excludes.includes(speakingOrder[1].user.username)) {
							console.log(`BLOCKED - ${speakingOrder[1].user.username} is in exclude.txt: ${message.content}`);
						}
						else {
							await speakingOrder[1].setNickname(nick)
								.then(console.log(`${msgGuild.name} -- ${speakingOrder[0].user.username} changed ${speakingOrder[1].user.username}'s nickname to "${nick}": "${message.content}"`))
								.catch ((err) => {
									if (err) {
										console.log("Yeah this pseron is cool... (owner shield block)");
									}
								});
						}
					}
				}
				
				for (const im of imMatches) {
					if (msg.match(im)) {
						nick = await msg.match(im)[2].slice(0,32);
					}
				}
				if (msgAuthor && excludes.includes(msgAuthor.user.username)) {
					// console.log(`BLOCKED - ${msgAuthor.user.username} is in exclude.txt: ${message.content}`);
				}
				else if (nick && !youre) {
					await msgAuthor.setNickname(nick)
						.then(console.log(`${msgGuild.name} -- ${msgAuthor.user.username} changed their nickname to ${nick}: "${message.content}"`))
						.catch ((err) => {
							if (err) {
								console.log("Yeah this pseron is cool... (owner shield block)");
							}
						});
				}
			}
			catch(error) {
				console.log(error);
			}
		});
	},
};