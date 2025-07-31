require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const express = require("express");
const app = express();
const config = require("./config.json");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity(config.Status, { type: "WATCHING" });
});

client.on("message", async message => {
  if (message.author.bot) return;

  // DM Forwarding
  if (message.channel.type === "dm") {
    const supportChannel = client.channels.cache.get(config.Roomid);
    if (!supportChannel) return;

    const embed = new Discord.MessageEmbed()
      .setTitle("New DM Ticket")
      .setDescription(message.content || "No content provided.")
      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .setColor("BLUE")
      .setFooter(`User ID: ${message.author.id}`)
      .setTimestamp();

    supportChannel.send(embed).catch(console.error);
    return message.react("✅").catch(console.error);
  }

  // Command Handler
  if (!message.content.startsWith(config.Prefix)) return;
  const args = message.content.slice(config.Prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "send") {
    if (!message.member.roles.cache.has(config.D_ROLE)) return message.reply("You don't have permission.");
    const [id, ...content] = args;
    if (!id || content.length === 0) return message.reply("Usage: !send <userID> <message>");
    const user = await client.users.fetch(id).catch(() => {});
    if (!user) return message.reply("Invalid User ID");
    user.send(content.join(" ")).then(() => message.reply("Message sent.")).catch(() => message.reply("Failed to send message."));
  }

  if (command === "close") {
    if (!message.member.roles.cache.has(config.D_ROLE)) return message.reply("You don't have permission.");
    const id = args[0];
    if (!id) return message.reply("Usage: !close <userID>");
    const user = await client.users.fetch(id).catch(() => {});
    if (!user) return message.reply("Invalid User ID");
    user.send("Your support ticket has been closed. Thank you!").catch(() => {});
    message.reply("Ticket closed.");
  }
});

client.login(process.env.TOKEN);

// Express Keep-Alive Server
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(process.env.PORT || 3000);
