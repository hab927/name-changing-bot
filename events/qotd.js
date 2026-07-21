const { Events, EmbedBuilder, ThreadAutoArchiveDuration } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        return; // i turned it off
        console.log("question of the day active!");

        const guild = client.guilds.cache.get('1305557183915888670'); 
        const channel = guild.channels.cache.get('1438608426358800435');

        cron.schedule('0 0 4 * * *', async () => { // new question at 7 am EST every day
            console.log(new Date() + ": beginning new QOTD creation.");
            const questionsPath = 'questions.txt';

            fs.readFile(questionsPath, 'utf8', async (err, contents) => {
                if (err) {
                    console.error(('file reading error'), err);
                    return;
                }
                let lines = contents.split(/\r?\n/);
                
                const questionNumber = Math.floor(Math.random() * lines.length);

                const QOTDembed = new EmbedBuilder()
                    .setColor(0xbb00ff)
                    .setTitle('Question of the day (' + new Date().toLocaleDateString() + ')')
                    .setDescription('*' + lines[questionNumber] + '*')

                let message = await channel.send({ embeds: [QOTDembed] });

                const thread = await message.startThread({
                    name: "Answer here",
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                    reason: "answer the question here"
                });

                // delete question from file
                let removedQuestion = lines.splice(questionNumber, 1)[0];
                let newQuestions = lines.join('\n');
                fs.writeFile(questionsPath, newQuestions, 'utf8', (err) => {
                    if (err) {
                        console.error('failed to write file', err);
                        return;
                    }
                    console.log('removed question ' + questionNumber + ': ' + removedQuestion);
                });
            });

        }, null, true);
    }
}