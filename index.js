// === Konfiguracja i importy ===
import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

// === Inicjalizacja Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// === Konfiguracja OpenAI ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Pamięć wiadomości na kanał ===
const conversationHistory = new Map();
const repliedMessages = new Set();
const HISTORY_LIMIT = 20;

// === Uruchomienie Express do self-ping ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot działa!'));
app.listen(PORT, () => console.log(`✅ Express działa na porcie ${PORT}`));

// === Funkcja do pingowania samego siebie co 5 minut ===
setInterval(() => {
  fetch(`http://localhost:${PORT}/`).catch(() => {});
}, 5 * 60 * 1000);

// === Gdy bot Discord się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;           // ignoruj bota
    if (!message.content.startsWith('!k')) return; // reaguj tylko na !k
    if (repliedMessages.has(message.id)) return;   // nie odpisuj dwa razy

    repliedMessages.add(message.id);

    const prompt = message.content.slice(2).trim(); // usuwa !k
    const channelId = message.channel.id;

    // pobierz historię i dodaj aktualną wiadomość
    const history = conversationHistory.get(channelId) || [];
    history.push({ role: 'user', content: prompt });

    // ogranicz historię do 20 wiadomości
    if (history.length > HISTORY_LIMIT) {
      conversationHistory.set(channelId, history.slice(-HISTORY_LIMIT));
    } else {
      conversationHistory.set(channelId, history);
    }

    // generuj odpowiedź
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Jesteś pomocnym asystentem Discorda.' },
        ...history
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
client.login(process.env.DISCORD_TOKEN);
