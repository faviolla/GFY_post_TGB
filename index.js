require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const sessions = {};

bot.start((ctx) => {
  ctx.reply("Вітаю! 👋\n\nЩоб створити нове повідомлення для клієнта, напишіть /new");
});

bot.command("new", (ctx) => {
  sessions[ctx.chat.id] = {};
  ctx.reply("Введіть ПІБ клієнта:");
});

bot.on("text", (ctx) => {
  if (ctx.message.text.startsWith("/")) return;

  const chatId = ctx.chat.id;
  const data = sessions[chatId];

  if (!data) {
    return ctx.reply("Напишіть /new, щоб почати нове підтвердження 😊");
  }

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

  if (!data.price) {
    data.price = ctx.message.text;
    return ctx.reply("Посилання для оплати:");
  }

  data.paylink = ctx.message.text;

  const result = `
Вітаємо, ${data.name}! 😊

Дякуємо за ваше замовлення в GoodforYou!

🔹 Primabiotic Collagen (${data.qty} одиниць)
🔹 Ціна: ${data.price} грн
🔹 Оплата при отриманні
🔹 ${data.address}

Одержувач: ${data.fullName}
📞 ${data.phone}

❗️Для підтвердження замовлення потрібна передоплата 200 грн (входить у вартість замовлення).
Після оплати одразу передаємо замовлення на відправку.

Оплата: ${data.paylink}

З турботою,
GoodforYou 💚`;

  ctx.reply(result);
  delete sessions[chatId];
  ctx.reply("Готово ✅\n\nЩоб створити нове повідомлення — напишіть /new");
});

bot.launch();
