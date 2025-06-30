document.getElementById('predictForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            industry: document.getElementById('industry').value,
            budget: document.getElementById('budget').value
        })
    });
    
    const result = await response.json();
    
    // Визуализация результатов
    const resultDiv = document.getElementById('predictionResult');
    resultDiv.innerHTML = `
        <h3>Рекомендуемый тренд: ${result.prediction.prediction}</h3>
        <p>Уверенность прогноза: ${(result.prediction.confidence * 100)}%</p>
        <canvas id="trendChart" width="400" height="200"></canvas>
    `;
    
    // Можно добавить Chart.js для визуализации
});