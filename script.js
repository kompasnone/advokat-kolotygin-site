// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка для навигации (ваш существующий код)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- ОБРАБОТКА ФОРМЫ ---
    const contactForm = document.getElementById('contact-form');

    // Проверяем, найден ли элемент формы. Если нет, выводим ошибку и прекращаем выполнение.
    if (!contactForm) {
        console.error('Ошибка: Элемент формы с ID "contact-form" не найден в DOM. Проверьте index.html и подключение script.js.');
        return; 
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    // Сохраняем исходный текст кнопки, чтобы вернуть его после отправки
    const originalButtonText = submitButton ? submitButton.textContent : 'Отправить сообщение'; 

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Отменяем стандартное поведение отправки формы

        console.log('Попытка отправки формы...'); // Сообщение для отладки

        // Блокируем кнопку и меняем текст
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
        }
        
        // Собираем данные формы
        const formData = new FormData(contactForm);
        
        // Отправляем данные на Netlify Function
        fetch('/.netlify/functions/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Важно для URLSearchParams
            },
            body: new URLSearchParams(formData).toString() // Преобразуем FormData в строку для отправки
        })
        .then(response => {
            // Проверяем, успешен ли ответ HTTP
            if (!response.ok) {
                // Если статус не 2xx, парсим ошибку из JSON ответа
                return response.json().then(errorData => {
                    throw new Error(errorData.message || `Сервер ответил ошибкой: ${response.status}`);
                });
            }
            return response.json(); // Парсим успешный JSON ответ
        })
        .then(data => {
            console.log('Успешный ответ от сервера:', data); // Сообщение для отладки
            
            // Успех!
            if (submitButton) submitButton.textContent = 'Отправлено!';
            contactForm.reset(); // Очищаем поля формы
            setTimeout(() => { // Возвращаем кнопку в исходное состояние
                if (submitButton) {
                   submitButton.textContent = originalButtonText;
                   submitButton.disabled = false;
                }
            }, 3000);
        })
        .catch(error => {
            console.error('Ошибка при отправке формы:', error); // Логируем ошибку JS
            if (submitButton) {
                submitButton.textContent = 'Ошибка отправки';
                // Можно добавить более детальное сообщение об ошибке для пользователя, если нужно
                setTimeout(() => {  
                   submitButton.textContent = originalButtonText;
                   submitButton.disabled = false;
                }, 4000);
            }
        });
    });
});
