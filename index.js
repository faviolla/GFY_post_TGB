require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const sessions = {};

bot.start((ctx) => {
  sessions[ctx.chat.id] = {};
  ctx.reply("Введіть ПІБ клієнта:");
});

bot.on("text", (ctx) => {
  const chatId = ctx.chat.id;
  const data = sessions[chatId];

  if (!data.fullName) {
    data.fullName = ctx.message.text;
    return ctx.reply("Введіть ім'я клієнта:");
  }

  if (!data.name) {
    data.name = ctx.message.text;
    return ctx.reply("Введіть номер телефону:");
  }

  if (!data.phone) {
    data.phone = ctx.message.text;
    return ctx.reply("Введіть адресу доставки:");
  }

  if (!data.address) {
    data.address = ctx.message.text;
    return ctx.reply("Кількість:");
  }

  if (!data.qty) {
    data.qty = ctx.message.text;
    return ctx.reply("Ціна:");
  }

  data.price = ctx.message.text;

  const result = `
Вітаємо, ${data.name}! 😊

Дякуємо за ваше замовлення в GoodforYou!

❗️Будь ласка, підтвердьте замовлення у відповідь на це повідомлення, щоб ми могли передати його на відправку.

🔹 Продукт: Primabiotic Collagen (${data.qty} одиниць)
🔹 Ціна: ${data.price} грн
🔹 Оплата: Оплата при отриманні
🔹 Доставка: ${data.address}

Одержувач: ${data.fullName}
📞 ${data.phone}

З турботою,
Команда GoodforYou 💚`;

  ctx.reply(result);
  delete sessions[chatId];
});

bot.launch();
