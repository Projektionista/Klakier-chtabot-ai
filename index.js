import OpenAI from "openai";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.on("ready", () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!chat")) {
    const prompt = message.content.replace("!chat", "").trim();

    if (!prompt) {
      return message.reply("💬 Napisz coś po komendzie, np. `!chat co to jest Render?`");
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Jesteś pomocnym asystentem Discorda." },
          { role: "user", content: prompt },
        ],
      });

      const reply = response.choices[0].message.content;
      await message.reply(reply);
    } catch (error) {
      console.error(error);
      message.reply("❌ Wystąpił błąd przy próbie uzyskania odpowiedzi od AI.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);


