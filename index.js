import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Odpowiada tylko, gdy ktoś napisze np. "!" na początku wiadomości
  if (message.content.startsWith('!')) {
    const prompt = message.content.slice(1);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const reply = completion.choices[0].message.content;
      await message.reply(reply);
    } catch (error) {
      console.error('❌ Błąd OpenAI:', error);
      await message.reply('⚠️ Coś poszło nie tak przy łączeniu z OpenAI.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
