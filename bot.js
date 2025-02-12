const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Register /generate command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "generate") {
    const userId = interaction.user.id;
    const now = Date.now();

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 60000);
        return interaction.reply({
          content: `⏳ You need to wait **${timeLeft} minutes** before using /generate again.`,
          ephemeral: true,
        });
      }
    }

    // Read accounts file
    let accounts = fs.readFileSync("accounts.txt", "utf8").split("\n").filter(line => line.trim() !== "");
    
    if (accounts.length === 0) {
      return interaction.reply({ content: "❌ No accounts available!", ephemeral: true });
    }

    // Select a random account
    const randomIndex = Math.floor(Math.random() * accounts.length);
    const selectedAccount = accounts[randomIndex];

    // Reply with the account (only user can see it)
    await interaction.reply({ content: `🎁 Here is your account:\n\`${selectedAccount}\``, ephemeral: true });

    // Update cooldown
    cooldowns.set(userId, now);
  }
});

client.login(process.env.TOKEN);
