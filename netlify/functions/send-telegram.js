// netlify/functions/send-telegram.js

exports.handler = async function (event, context) {
  // Разрешаем только POST-запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  // Получаем секреты из переменных окружения Netlify
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  // --- НАЧАЛО ВРЕМЕННОГО КОДА ДЛЯ ОТЛАДКИ ---
  console.log('DEBUG: TELEGRAM_BOT_TOKEN received (first 5 chars):', TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 5) + '...' : 'Not set');
  console.log('DEBUG: TELEGRAM_CHAT_ID received:', TELEGRAM_CHAT_ID || 'Not set');
  // --- КОНЕЦ ВРЕМЕННОГО КОДА ДЛЯ ОТЛАДКИ ---

  // Проверяем наличие токена и Chat ID. Это критично для работы.
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Ошибка конфигурации сервера: Отсутствуют переменные окружения TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID.');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server configuration error: missing Telegram credentials.' }),
    };
  }

  try {
    // Парсим данные, пришедшие с формы, используя URLSearchParams, так как Content-Type: application/x-www-form-urlencoded
    const data = new URLSearchParams(event.body);
    // Получаем значения полей по их атрибутам 'name' из HTML
    const name = data.get('Имя') || 'Не указано'; 
    const phone = data.get('Телефон') || 'Не указан';
    const message = data.get('Сообщение') || 'Нет сообщения';

    // Формируем красивое сообщение для Telegram с использованием HTML-форматирования
    let text = `<b>Новая заявка с сайта!</b>\n\n`;
    text += `<b>Имя:</b> ${name}\n`;
    text += `<b>Телефон:</b> ${phone}\n`;
    text += `<b>Сообщение:</b>\n${message}`;
    
    // URL для запроса к Telegram Bot API
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // --- НАЧАЛО ВРЕМЕННОГО КОДА ДЛЯ ОТЛАДКИ ---
    console.log('DEBUG: Constructed Telegram API URL (partial token):', url.replace(TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_TOKEN.substring(0, 5) + '...'));
    // --- КОНЕЦ ВРЕМЕННОГО КОДА ДЛЯ ОТЛАДКИ ---

    // Отправляем сообщение
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Для Telegram API нужно отправлять JSON
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML', // Указываем, что текст содержит HTML-теги
      }),
    });

    if (!response.ok) {
      // Если Telegram API вернул ошибку, логируем её и возвращаем пользователю
      const errorData = await response.json();
      console.error('Ошибка от Telegram API:', errorData);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: `Не удалось отправить сообщение: ${errorData.description || response.statusText}` }),
      };
    }

    // Возвращаем успешный ответ, если всё прошло хорошо
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Сообщение успешно отправлено!' }),
    };
  } catch (error) {
    // Ловим любые другие ошибки, которые могли произойти в процессе выполнения функции
    console.error('Ошибка выполнения функции:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Произошла внутренняя ошибка сервера: ${error.message}` }),
    };
  }
};
