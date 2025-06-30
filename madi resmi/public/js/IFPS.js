document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Добавить honeypot поле
    const hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'honeypot';
    hp.style.display = 'none';
    form.appendChild(hp);
    
    // Засечь время начала заполнения
    form.dataset.startTime = Date.now();
    
    // Вешаем обработчик отправки
    form.addEventListener('submit', function(e) {
      if(hp.value !== '') {
        e.preventDefault();
        alert('Bot detected!');
        return;
      }
      
      const fillTime = (Date.now() - parseInt(form.dataset.startTime)) / 1000;
      if(fillTime < 3) {
        e.preventDefault();
        alert('Please fill the form properly');
      }
    });
  });
});