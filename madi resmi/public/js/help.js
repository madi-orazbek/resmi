document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.getElementById('supportForm');
    
    if (supportForm) {
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('support-name').value,
                email: document.getElementById('support-email').value,
                topic: document.getElementById('support-topic').value,
                message: document.getElementById('support-message').value
            };
            
            try {
                const response = await fetch('/api/help-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                    supportForm.reset();
                } else {
                    throw new Error(result.error || 'Ошибка при отправке');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
            }
        });
    }
    
    // Анимация для шагов
    const steps = document.querySelectorAll('.step');
    if (steps.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });
        
        steps.forEach(step => observer.observe(step));
    }
});

// Добавляем в конец файла help.js

// Функционал FAQ аккордеона
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const answer = question.nextElementSibling;
        
        // Закрываем все открытые вопросы
        document.querySelectorAll('.faq-item').forEach(el => {
            if (el !== item && el.classList.contains('active')) {
                el.classList.remove('active');
                el.querySelector('.faq-answer').style.maxHeight = null;
                el.querySelector('.faq-question').classList.remove('active');
            }
        });
        
        // Переключаем текущий вопрос
        item.classList.toggle('active');
        question.classList.toggle('active');
        
        if (item.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = null;
        }
    });
});

// Автоматическое открытие FAQ если перешли по якорю
window.addEventListener('load', () => {
    if (window.location.hash === '#faq') {
        const firstQuestion = document.querySelector('.faq-question');
        if (firstQuestion) {
            firstQuestion.click();
        }
    }
}); 
