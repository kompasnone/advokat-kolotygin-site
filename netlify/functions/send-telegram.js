// netlify/functions/send-telegram.js

exports.handler = async function (event, context) {
  // Разрешаем только POST-запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Получаем секреты из переменных окружения
  const { 8047639451:AAFAq8Wgm_HF0y1q_HUDQ_u5lrU2W1ZHn7Q, 1129860825 } = process.env;

  if (!8047639451:AAFAq8Wgm_HF0y1q_HUDQ_u5lrU2W1ZHn7Q || !1129860825) {
    return {
      statusCode: 500,
      body: 'Server configuration error: missing Telegram credentials.',
    };
  }

  try {
    // Парсим данные, пришедшие с формы
    const data = new URLSearchParams(event.body);
    const name = data.get('Имя') || 'Не указано';
    const phone = data.get('Телефон') || 'Не указан';
    const message = data.get('Сообщение') || 'Нет сообщения';

    // Формируем красивое сообщение для Telegram
    let text = `<b>Новая заявка с сайта!</b>\n\n`;
    text += `<b>Имя:</b> ${name}\n`;
    text += `<b>Телефон:</b> ${phone}\n`;
    text += `<b>Сообщение:</b>\n${message}`;

    // URL для запроса к Telegram API
    const url = `https://api.telegram.org/bot${8047639451:AAFAq8Wgm_HF0y1q_HUDQ_u5lrU2W1ZHn7Q}/sendMessage`;

    // Отправляем сообщение
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: 1129860825,
        text: text,
        parse_mode: 'HTML', // Позволяет использовать HTML-теги для форматирования
      }),
    });

    if (!response.ok) {
      // Если Telegram вернул ошибку, логируем ее
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return {
        statusCode: 500,
        body: 'Failed to send message.',
      };
    }

    // Возвращаем успешный ответ
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully!' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
