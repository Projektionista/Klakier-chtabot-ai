// === Importy ===
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import express from 'express';

// === Express dla Render ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Discord działa!'));
app.listen(PORT, () => console.log(`🌐 Serwer HTTP działa na porcie ${PORT}`));

// === Discord + OpenAI konfiguracja ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Pamięć rozmów dla każdego użytkownika ===
const conversations = new Map(); // userId -> [{role, content}, ...]

// === Gdy bot się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return; // ignoruj boty

    if (message.content.startsWith('!k')) {
      const prompt = message.content.slice(1).trim();

      // Pobierz historię użytkownika lub utwórz nową
      const history = conversations.get(message.author.id) || [
        { role: 'system', content: 'Jesteś pomocnym asystentem Discorda.' }
      ];

      // Dodaj wiadomość użytkownika
      history.push({ role: 'user', content: prompt });

      // Wywołanie OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // możesz zmienić na inny model
        messages: history,
      });

      const reply = response.choices[0].message.content;

      // Dodaj odpowiedź bota do historii
      history.push({ role: 'assistant', content: reply });
      conversations.set(message.author.id, history);

      await message.reply(reply);
    }
  } catch (error) {
    console.error('❌ Błąd:', error);
    await message.reply('Wystąpił błąd przy generowaniu odpowiedzi 😢');
  }
});

// === Logowanie bota ===
client.login(process.env.DISCORD_TOKEN);
