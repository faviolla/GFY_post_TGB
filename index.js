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

bot.on("callback_query", (ctx) => {
  const chatId = ctx.chat.id;
  const data = sessions[chatId];

  if (!data) return;

  if (ctx.callbackQuery.data === "collagen") {
    data.product = "Primabiotic Collagen";
  }

  if (ctx.callbackQuery.data === "hyaluron") {
    data.product = "Primabiotic Hyaluron";
  }

  ctx.answerCbQuery();
  ctx.reply("Кількість:");
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

    return ctx.reply("Оберіть продукт:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Primabiotic Collagen", callback_data: "collagen" }],
          [{ text: "Primabiotic Hyaluron", callback_data: "hyaluron" }],
        ],
      },
    });
  }

  if (!data.product) {
    return;
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

Дякуємо за замовлення в GoodforYou!

🔹 ${data.product} (${data.qty} одиниць)
🔹 Ціна: ${data.price} грн
🔹 До оплати при отриманні: ${data.price - 200} грн
🔹 ${data.address}

Одержувач: ${data.fullName}
📞 ${data.phone}

Для підтвердження замовлення необхідна передоплата 200 грн.
Після оплати одразу передаємо замовлення на відправку.

Посилання для оплати:
${data.paylink}

З турботою,
GoodforYou 💚`;

  ctx.reply(result);
  delete sessions[chatId];
  ctx.reply("Готово ✅\n\nЩоб створити нове повідомлення — напишіть /new");
});

bot.launch();
