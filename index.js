// === Konfiguracja i importy ===
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import express from 'express';

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

// === Express dla self-ping (utrzymanie bota online) ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot działa!'));
app.listen(PORT, () => console.log(`Express działa na porcie ${PORT}`));

// === Pamięć wiadomości, aby nie odpowiadać dwa razy ===
const repliedMessages = new Set();
const conversationHistory = new Map(); // {channelId: [{role, content}, ...]}

// === Gdy bot się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  try {
    // Ignoruj wiadomości bota
    if (message.author.bot) return;

    // Ignoruj, jeśli już odpowiedzieliśmy na tę wiadomość
    if (repliedMessages.has(message.id)) return;
    repliedMessages.add(message.id);

    // Reaguj tylko na "!k"
    if (!message.content.startsWith('!k')) return;

    const prompt = message.content.slice(2).trim();

    // Przygotuj historię konwersacji
    let history = conversationHistory.get(message.channel.id) || [];
    history.push({ role: 'user', content: prompt });

    // Odpowiedź od OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Jesteś pomocnym asystentem Discorda.' },
        ...history
      ],
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);

    // Dodaj odpowiedź bota do historii
    history.push({ role: 'assistant', content: reply });
    conversationHistory.set(message.channel.id, history);

    // Ograniczenie historii do 10 ostatnich wiadomości
    if (history.length > 20) {
      conversationHistory.set(message.channel.id, history.slice(-20));
    }

  } catch (error) {
    console.error('❌ Błąd:', error);
    await message.reply('Wystąpił błąd przy generowaniu odpowiedzi 😢');
  }
});

// === Logowanie bota ===
client.login(process.env.DISCORD_TOKEN);


