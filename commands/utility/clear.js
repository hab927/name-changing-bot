const { SlashCommandBuilder } = require('discord.js');
const { db_uri } = require('../../config.json');
const { MongoClient } = require('mongodb');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('(dev only command) Clears the database in this server.')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {

        if (interaction.user.id != "186964491890720769") {
            await interaction.reply("you are not hab. nice try buckarooni");
        }
        else {
            const m_client = new MongoClient(db_uri);
            await m_client.connect();
            const db = m_client.db("isat_verification");
            const coll = db.collection(interaction.guild.id);
            await coll.deleteMany({});
            await interaction.reply("Deletion successful");
            await m_client.close();
        }
    }
}