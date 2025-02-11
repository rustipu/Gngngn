const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const cooldowns = new Map(); // Track user cooldowns

// Load accounts from a file
function getRandomAccount() {
    const accounts = fs.readFileSync("accounts.txt", "utf8").split("\n").filter(line => line.trim() !== "");
    if (accounts.length === 0) return null;
    return accounts[Math.floor(Math.random() * accounts.length)];
}

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Register slash command globally
    const commands = [
        new SlashCommandBuilder()
            .setName('generate')
            .setDescription('Get a randomly generated account')
    ];

    await client.application.commands.set(commands);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== "generate") return;

    const userId = interaction.user.id;
    const now = Date.now();
    const cooldown = cooldowns.get(userId);

    if (cooldown && now - cooldown < 3600000) { // 1-hour cooldown
        const remainingTime = Math.ceil((3600000 - (now - cooldown)) / 60000);
        return interaction.reply({ content: `⏳ You need to wait **${remainingTime} minutes** before generating again!`, ephemeral: true });
    }

    const account = getRandomAccount();
    if (!account) {
        return interaction.reply({ content: "⚠️ No accounts available! Please wait for a restock.", ephemeral: true });
    }

    cooldowns.set(userId, now);
    await interaction.reply({ content: `🎉 Here is your account: \`${account}\``, ephemeral: true });
});

client.login(process.env.TOKEN);
