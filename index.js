// === Konfiguracja i importy ===
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

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

// === Gdy bot się uruchomi ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}!`);
});

// === Obsługa wiadomości ===
client.on('messageCreate', async (message) => {
  try {
    // Ignoruj wiadomości bota
    if (message.author.bot) return;

    // Jeśli wiadomość zaczyna się od "!"
    if (message.content.startsWith('!')) {
      const prompt = message.content.slice(1).trim();

      // Odpowiedź od OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // możesz zmienić na "gpt-4o" jeśli chcesz lepsze odpowiedzi
        messages: [
          { role: 'syst
