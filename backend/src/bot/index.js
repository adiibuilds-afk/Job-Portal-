const { Telegraf } = require('telegraf');
const registerCommands = require('./handlers/commands');
const registerTextHandler = require('./handlers/text');

const setupBot = (token) => {
  const bot = new Telegraf(token);
  const userSessions = {};

  // Register Handlers
  registerCommands(bot, userSessions);
  registerTextHandler(bot, userSessions);

  bot.launch()
    .then(() => {
      console.log('🤖 Telegram Bot is running...');
    })
    .catch((err) => {
      console.error('Bot launch error:', err);
    });

  process.once('SIGINT', () => { try { bot.stop('SIGINT'); } catch(e) {} });
  process.once('SIGTERM', () => { try { bot.stop('SIGTERM'); } catch(e) {} });

  return bot;
};

module.exports = setupBot;
