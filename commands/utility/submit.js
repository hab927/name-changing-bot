const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { fileURLToPath } = require('url');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addquestion')
		.setDescription('Adds a question to the QOTD list.')
        .addStringOption((option) =>
            option.setName('question')
                  .setDescription('The question you want to submit to the list')
        ),
	async execute(interaction) {
        const questionsPath = 'questions.txt';
        
		let inputQuestion = interaction.options.data[0].value;
        let questionWriter = interaction.user.username;

        fs.appendFile(questionsPath, inputQuestion + '\n', (err) => {
            if (err) {
                console.error('couldn\'t append to file: ', err);
            }
            else {
                console.log(questionWriter + ' submitted question "' + inputQuestion + '"!');
            }
        });

        await interaction.reply("Question submitted!");
	},
};
