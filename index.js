// === Importy i konfiguracja ===
import 'dotenv/config';
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

// === Inicjalizacja Express (dla Render) ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Bot Discord + OpenAI działa 24/7!');
});

app.listen(PORT, () => {
  console.log(`🌐 Serwer Express działa na porcie ${PORT}`);
});

// === Inicjalizacja bota Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// === Konfiguracja OpenAI ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === Gdy bot się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const prompt = message.content.slice(1).trim();
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Jesteś pomocnym asystentem Discorda.' },
        { role: 'user', content: prompt }
      ],
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);
  } catch (error) {
    console.error('❌ Błąd:', error);
    await message.reply('Wystąpił błąd przy generowaniu odpowiedzi 😢');
  }
});

// === Logowanie bota ===
client.login(process.env.DISCORD)
