const { Events } = require('discord.js');
const readline = require('readline');
const fs = require('fs');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		let msgAuthor, msgGuild;

		let speakingOrder = ["", ""]; //speakingOrder[0] is first person, speakingOrder[1] is the person before
		let channelOrder = ["", ""]; // are these two people in the same channel
		const imMatch1 = /\b(i'm )(.+)/i;
		const imMatch2 = /\b(im )(.+)/i;
		const imMatch3 = /\b(i am )(.+)/i;
		const youreMatch1 = /\b(youre )(.+)/i;
		const youreMatch2 = /\b(you're )(.+)/i;
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

		client.on('messageCreate', async (message) => {
			try {
				let youre = false;

				await client.guilds.fetch(message.guildId);
				msgGuild = await client.guilds.cache.get(message.guildId); 		// as a Guild
				msgAuthor = await message.member; 	// as a GuildMember
	
				if (msgAuthor == client.user.id) { // this shouldn't happen but anyways
					console.log("replied to own bot");
					return;
				}
	
				let nick = "";

				if (speakingOrder[0] != msgAuthor) { // new person speaking (moshi moshi?)
					speakingOrder.unshift(msgAuthor);
					channelOrder.unshift(message.guildId);
					speakingOrder = speakingOrder.slice(0,2);
					channelOrder = channelOrder.slice(0,2);
				}

				msg = await message.content;

				// reply check
				if (message.reference) {
					let nick = "";
					const repliedmsg = await message.fetchReference();
					const target = await msgGuild.members.cache.get(repliedmsg.author.id);

					if (msg.match(youreMatch1)) {
						nick = await msg.match(youreMatch1)[2].slice(0,32);
					}
					else if (msg.match(youreMatch2)) {
						nick = await msg.match(youreMatch2)[2].slice(0,32);
					}
					else if (msg.match(youreMatch3)) {
						nick = await msg.match(youreMatch3)[2].slice(0,32);
					}
					else if (msg.match(youreMatch4)) {
						nick = await msg.match(youreMatch4)[2].slice(0,32);
					}
					else if (msg.match(youreMatch5)) {
						nick = await msg.match(youreMatch5)[2].slice(0,32);
					}

					if (target && excludes.includes(target.user.username)) {
						console.log(`BLOCKED - ${target.user.username} is in exclude.txt: ${message.content}`);
					}
					else if (nick && target) {
						await target.setNickname(nick)
							.then(console.log(`${msgAuthor.user.username} changed ${target.user.username}'s nickname to ${nick}`))
							.catch(console.error);
					}
				}
				else {
					if (msg.match(imMatch1)) {
						nick = await msg.match(imMatch1)[2].slice(0,32);
					}
					else if (msg.match(imMatch2)) {
						nick = await msg.match(imMatch2)[2].slice(0,32);
					}
					else if (msg.match(imMatch3)) {
						nick = await msg.match(imMatch3)[2].slice(0,32);
					}
					if (msgAuthor && excludes.includes(msgAuthor.user.username)) {
						console.log(`BLOCKED - ${msgAuthor.user.username} is in exclude.txt: ${message.content}`);
					}
					else if (nick) {
						await msgAuthor.setNickname(nick)
							.then(console.log(`${msgAuthor.user.username} changed their nickname to ${nick}: "${message.content}"`))
							.catch(console.error);
					}
	
					// want to make the first person who spoke change the name of the second
					else if (msg.match(youreMatch1)) {
						nick = await msg.match(youreMatch1)[2].slice(0,32);
						youre = true;
					}
					else if (msg.match(youreMatch2)) {
						nick = await msg.match(youreMatch2)[2].slice(0,32);
						youre = true;
					}
					else if (msg.match(youreMatch3)) {
						nick = await msg.match(youreMatch3)[2].slice(0,32);
						youre = true;
					}
					else if (msg.match(youreMatch4)) {
						nick = await msg.match(youreMatch4)[2].slice(0,32);
						youre = true;
					}
					else if (msg.match(youreMatch5)) {
						nick = await msg.match(youreMatch5)[2].slice(0,32);
						youre = true;
					}
					if (speakingOrder[1] && excludes.includes(speakingOrder[1].user.username)) {
						console.log(`BLOCKED - ${speakingOrder[1].user.username} is in exclude.txt: ${message.content}`);
					}
					else if (speakingOrder[0] && speakingOrder[1] && nick && youre && (channelOrder[0] === channelOrder[1])) {
						await speakingOrder[1].setNickname(nick)
							.then(console.log(`${speakingOrder[0].user.username} changed ${speakingOrder[1].user.username}'s nickname to ${nick}: "${message.content}"`))
							.catch(console.error);
						youre = false;
					}
				}
	
			}
			catch(error) {
				console.log(error);
			}
		});
	},
};