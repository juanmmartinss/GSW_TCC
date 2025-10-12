// script.js

// Alternância entre seções
document.getElementById("btnComandos").addEventListener("click", () => {
    document.getElementById("comandosSection").classList.remove("hidden");
    document.getElementById("telemetriasSection").classList.add("hidden");
});

document.getElementById("btnTelemetrias").addEventListener("click", () => {
    document.getElementById("telemetriasSection").classList.remove("hidden");
    document.getElementById("comandosSection").classList.add("hidden");
});

// Envia o comando "open" via POST para o backend
function enviarComando() {
    fetch("http://localhost:8000/send_command", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({})
    })
    .then(async response => {
        const resposta = document.getElementById("respostaComando");

        if (!response.ok) {
            const errorData = await response.json();
            resposta.textContent = `❌ Erro: ${errorData.detail}`;
            return;
        }

        const data = await response.json();
        resposta.textContent = `✅ ${data.message}`;
    })
    .catch(error => {
        const resposta = document.getElementById("respostaComando");
        resposta.textContent = "❌ Erro ao enviar comando.";
        console.error("Erro:", error);
    });
}

// Configuração geral dos gráficos
const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: { 
        y: { beginAtZero: false },
        x: { display: true, ticks: { maxRotation: 0, minRotation: 0 } } 
    },
    animation: {
        duration: 300
    }
};

// --- GRÁFICOS ATUALIZADOS ---

// 1. Gráfico de Altitude (continua igual)
let altitudeChart = new Chart(document.getElementById("altitudeChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Altitude (m)",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            fill: true,
            tension: 0.3
        }]
    },
    options: chartOptions
});

// 2. Novo Gráfico de Temperatura
let temperatureChart = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Temperatura (°C)",
            data: [],
            backgroundColor: "rgba(255, 159, 64, 0.2)", // Laranja
            borderColor: "rgba(255, 159, 64, 1)",
            fill: true,
            tension: 0.3
        }]
    },
    options: chartOptions
});

// 3. Novo Gráfico de Pressão
let pressureChart = new Chart(document.getElementById("pressureChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Pressão (hPa)",
            data: [],
            backgroundColor: "rgba(153, 102, 255, 0.2)", // Roxo
            borderColor: "rgba(153, 102, 255, 1)",
            fill: true,
            tension: 0.3
        }]
    },
    options: chartOptions
});

// --- FIM DA ATUALIZAÇÃO DOS GRÁFICOS ---


// Busca e atualiza telemetrias
async function fetchTelemetries() {
    try {
        const res = await fetch('/telemetries');
        const data = await res.json();
        const container = document.getElementById("telemetry-container");

        if (!data || data.length === 0) {
            container.innerHTML = "<p>Nenhuma telemetria disponível.</p>";
            return;
        }

        data.reverse();

        let html = "<ul>";
        data.forEach(t => {
            html += `<li>
                <strong>${new Date(t.timestamp).toLocaleString('pt-BR')}</strong><br>
                <b>Temp:</b> ${t.temperature}°C | <b>Hum:</b> ${t.humidity}%<br>
                <b>Giroscópio:</b> ${t.gyx}, ${t.gyy}, ${t.gyz} rad/s | 
                <b>Acelerômetro:</b> ${t.acx}, ${t.acy}, ${t.acz} m/s²<br>
                <b>Pressão:</b> ${t.pressure} hPa | <b>Altitude:</b> ${t.altitude} m | <b>Direção:</b> ${t.dir}<br>
            </li>`;
        });
        html += "</ul>";
        container.innerHTML = html;

        const latestTelemetry = data[0];
        
        // Lógica de atualização para TODOS os gráficos
        const MAX_DATA_POINTS = 10;
        const allCharts = [altitudeChart, temperatureChart, pressureChart];

        if (allCharts[0].data.labels.length >= MAX_DATA_POINTS) {
            allCharts.forEach(chart => {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            });
        }

        const label = new Date(latestTelemetry.timestamp).toLocaleTimeString('pt-BR');
        
        // Adiciona os novos dados a cada gráfico
        altitudeChart.data.labels.push(label); // Apenas um gráfico precisa adicionar o label
        temperatureChart.data.labels.push(label);
        pressureChart.data.labels.push(label);

        altitudeChart.data.datasets[0].data.push(latestTelemetry.altitude);
        temperatureChart.data.datasets[0].data.push(latestTelemetry.temperature);
        pressureChart.data.datasets[0].data.push(latestTelemetry.pressure);
        
        // Atualiza todos os gráficos
        allCharts.forEach(chart => chart.update());

        document.getElementById("localizacao").textContent = "Dados de GPS não disponíveis";

    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
}

setInterval(fetchTelemetries, 2000);
document.addEventListener("DOMContentLoaded", fetchTelemetries);
