require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const sessions = {};

//Start

bot.start((ctx) => {
  ctx.reply("Вітаю! 👋\n\nОберіть тип повідомлення:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Передоплата 200 грн", callback_data: "prepay" }],
        [{ text: "Повідомлення з ТТН", callback_data: "ttn" }],
      ],
    },
  });
});

//Buttons

bot.on("callback_query", (ctx) => {
  const chatId = ctx.chat.id;
  const action = ctx.callbackQuery.data;

  if (action === "prepay") {
    sessions[chatId] = {
      type: "prepay",
    };

    ctx.answerCbQuery();
    return ctx.reply("Введіть ПІБ клієнта:");
  }

  if (action === "ttn") {
    sessions[chatId] = {
      type: "ttn",
    };

    ctx.answerCbQuery();
    return ctx.reply("Введіть номер ТТН:");
  }

  const data = sessions[chatId];

  if (!data) return;

  if (action === "collagen") {
    data.product = "Primabiotic Collagen";
  }

  if (action === "hyaluron") {
    data.product = "Primabiotic Hyaluron";
  }

  ctx.answerCbQuery();
  ctx.reply("Кількість:");
})

// bot.command("new", (ctx) => {
//   sessions[ctx.chat.id] = {};
//   ctx.reply("Введіть ПІБ клієнта:");
// });

// bot.on("callback_query", (ctx) => {
//   const chatId = ctx.chat.id;
//   const data = sessions[chatId];

//   if (!data) return;

//   if (ctx.callbackQuery.data === "collagen") {
//     data.product = "Primabiotic Collagen";
//   }

//   if (ctx.callbackQuery.data === "hyaluron") {
//     data.product = "Primabiotic Hyaluron";
//   }

//   ctx.answerCbQuery();
//   ctx.reply("Кількість:");
// });

bot.on("text", (ctx) => {
  if (ctx.message.text.startsWith("/")) return;

  const chatId = ctx.chat.id;
  const data = sessions[chatId];

  if (!data) {
    return ctx.reply("Напишіть /start 😊");
  }

  if (data.type === "ttn") {
    data.ttn = ctx.message.text;

    const result = `
Оплату отримали, дякуємо!

Номер ТТН Нової пошти: ${data.ttn}

Посилку готуємо до передачі перевізнику 📦

Дякуємо, що обрали GoodforYou 💚`;

    ctx.reply(result);

    delete sessions[chatId];

    return ctx.reply("Готово ✅\n\nНапишіть /start для нового повідомлення");
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

Ваше замовлення готове до відправки 📦

🔹 ${data.product} (${data.qty} одиниць)
🔹 Сума замовлення: ${data.price} грн
🔹 До оплати при отриманні: ${data.price - 200} грн

📍 Нова пошта ${data.address}

Одержувач: ${data.fullName}
📞 ${data.phone}

Для відправки необхідно внести передоплату 200 грн.
Передоплата враховується у загальну суму замовлення.

🔒 Безпечна оплата через Monobank:
${data.paylink}

Після оплати надішліть “+” або скрін оплати у відповідь 💚

`;

  ctx.reply(result);
  delete sessions[chatId];
  ctx.reply("Готово ✅\n\nНапишіть /start для нового повідомлення");
});

bot.launch();
