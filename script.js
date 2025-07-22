document.addEventListener('DOMContentLoaded', function() {
    
    // --- Плавная прокрутка для якорных ссылок ---
    const navLinks = document.querySelectorAll('.nav-link, .btn, a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Проверяем, есть ли у ссылки хэш (якорь)
            if (this.hash !== "") {
                // Предотвращаем стандартное поведение
                e.preventDefault();

                const hash = this.hash;
                const targetElement = document.querySelector(hash);

                if (targetElement) {
                    // Вычисляем позицию элемента с отступом для фиксированной шапки
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 65; // 65px - примерная высота шапки

                    // Выполняем плавную прокрутку
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Для мобильного меню: закрываем меню после клика, если оно открыто
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                            toggle: false
                        });
                        bsCollapse.hide();
                    }
                }
            }
        });
    });

    // --- Обработка формы контактов с отправкой в Telegram ---
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Предотвращаем стандартную отправку формы

            // Показываем пользователю, что идет отправка
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';

            const formData = new FormData(contactForm);
            
            // Отправляем данные на нашу serverless-функцию
            fetch('/.netlify/functions/send-telegram', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                // Если сервер вернул ошибку, создаем promise, который будет отклонен
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Ошибка на стороне сервера');
                });
            })
            .then(data => {
                // Успех!
                submitButton.textContent = 'Отправлено!';
                contactForm.reset(); // Очищаем поля формы
                setTimeout(() => { // Возвращаем кнопку в исходное состояние через 3 секунды
                   submitButton.textContent = originalButtonText;
                   submitButton.disabled = false;
                }, 3000);
            })
            .catch(error => {
                // Ошибка
                console.error('Submit error:', error);
                submitButton.textContent = 'Ошибка отправки';
                
                setTimeout(() => { // Возвращаем кнопку в исходное состояние через 4 секунды
                   submitButton.textContent = originalButtonText;
                   submitButton.disabled = false;
                }, 4000);
            });
        });
    }
});