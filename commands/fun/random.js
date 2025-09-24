const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Rolls 1-6.'),
	async execute(interaction) {
		await interaction.reply(String(Math.floor(Math.random()*6)+1));
	},
};