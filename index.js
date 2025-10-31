// === Konfiguracja i importy ===
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import express from 'express';

// === Pamięć historii rozmów per kanał ===
const conversationHistory = {};

// === Inicjalizacja klienta Discord ===
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

// === Inicjalizacja Express (dla Render / 24/7) ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot działa!'));
app.listen(PORT, () => console.log(`🌐 Serwer działa na porcie ${PORT}`));

// === Gdy bot Discord się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;               // ignoruj własne wiadomości bota
  if (!message.content.startsWith('!k')) return; // tylko komendy z "!"

  const prompt = message.content.slice(1).trim();
  const channelId = message.channel.id;

  // Jeśli brak historii dla kanału, inicjalizuj
  if (!conversationHistory[channelId]) {
    conversationHistory[channelId] = [
      { role: 'system', content: 'Jesteś pomocnym asystentem Discorda.' }
    ];
  }

  // Dodaj wiadomość użytkownika do historii
  conversationHistory[channelId].push({ role: 'user', content: prompt });

  try {
    // Wywołanie OpenAI z historią
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // możesz zmienić np. na gpt-5-mini
      messages: conversationHistory[channelId]
    });

    const reply = response.choices[0].message.content;

    await message.reply(reply);

    // Dodaj odpowiedź bota do historii
    conversationHistory[channelId].push({ role: 'assistant', content: reply });

    // Przycinanie historii do max 40 wiadomości (20 user + 20 bot)
    if (conversationHistory[channelId].length > 40) {
      conversationHistory[channelId] = conversationHistory[channelId].slice(-40);
    }

  } catch (error) {
    console.error('❌ Błąd:', error);
    await message.reply('Wystąpił błąd przy generowaniu odpowiedzi 😢');
  }
});

// === Logowanie bota Discord ===
client.login(process.env.DISCORD_TOKEN);



