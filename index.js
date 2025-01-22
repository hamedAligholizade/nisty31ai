require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Initialize bot with your token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Ollama API endpoint from environment variable
const OLLAMA_API = process.env.OLLAMA_API || 'http://ollama:11434/api/generate';

// Handle start command
bot.command('start', (ctx) => {
    ctx.reply('Hello! I am your AI assistant. Send me a message and I\'ll respond using Ollama AI.');
});

// Handle messages
bot.on('text', async (ctx) => {
    const messageText = ctx.message.text;

    // Ignore if message is empty
    if (!messageText) return;

    try {
        // Show typing status
        await ctx.replyWithChatAction('typing');

        // Make request to Ollama
        const response = await axios.post(OLLAMA_API, {
            model: 'llama3.2',  // Using llama2 base model
            prompt: messageText,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 1000,  // Maximum length of response
            }
        });

        // Send response back to user
        if (response.data && response.data.response) {
            await ctx.reply(response.data.response, {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("Sorry, I couldn't generate a response.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        await ctx.reply("Sorry, there was an error processing your request.", {
            reply_to_message_id: ctx.message.message_id
        });
    }
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
});

// Start the bot
bot.launch()
    .then(() => console.log('Bot is running...'))
    .catch((err) => console.error('Bot launch failed:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 