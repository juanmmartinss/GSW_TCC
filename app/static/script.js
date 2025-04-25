let chartAltura, chartTemperatura;

// Alternância entre seções
document.getElementById("btnComandos").addEventListener("click", () => {
    document.querySelector(".visual-area").style.display = "none";
    document.querySelector(".telemetry-area").style.display = "block";
});

document.getElementById("btnTelemetrias").addEventListener("click", () => {
    document.querySelector(".visual-area").style.display = "block";
    document.querySelector(".telemetry-area").style.display = "block";
});

// Inicializar gráficos
function initCharts() {
    const ctxAltura = document.getElementById('graficoAltura').getContext('2d');
    const ctxTemperatura = document.getElementById('graficoTemperatura').getContext('2d');

    chartAltura = new Chart(ctxAltura, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Altura (m)',
                data: [],
                borderColor: 'blue',
                backgroundColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    chartTemperatura = new Chart(ctxTemperatura, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                borderColor: 'red',
                backgroundColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Atualiza tudo visual
function atualizarGraficos(data) {
    const latest = data[data.length - 1];

    const timestamps = data.map(t => new Date(t.timestamp).toLocaleTimeString());
    const alturas = data.map(t => t.altitude);
    const temperaturas = data.map(t => t.temperature);

    chartAltura.data.labels = timestamps;
    chartAltura.data.datasets[0].data = alturas;
    chartAltura.update();

    chartTemperatura.data.labels = timestamps;
    chartTemperatura.data.datasets[0].data = temperaturas;
    chartTemperatura.update();

    atualizarIndicadores(latest);
}

// Atualizar pressão, bateria e coordenadas
function atualizarIndicadores(dado) {
    // Pressão
    const pressao = dado.pressure;
    const pressaoPercent = Math.min(100, (pressao / 1050) * 100);
    document.getElementById("pressaoBar").style.width = `${pressaoPercent}%`;
    document.getElementById("pressaoValor").innerText = `${pressao} hPa`;

    // Bateria
    const bateria = dado.battery;
    const bateriaPercent = Math.min(100, bateria);
    document.getElementById("bateriaBar").style.width = `${bateriaPercent}%`;
    document.getElementById("bateriaValor").innerText = `${bateria}%`;

    // Coordenadas
    const coords = `Lat: ${dado.latitude.toFixed(4)}, Long: ${dado.longitude.toFixed(4)}`;
    document.getElementById("coordText").innerText = coords;
}

// Buscar dados
const fetchTelemetries = async () => {
    try {
        const res = await fetch('/telemetries');
        const data = await res.json();
        const container = document.getElementById("telemetry-container");

        if (!data.length) {
            container.innerHTML = "<p>Nenhuma telemetria disponível.</p>";
            return;
        }

        let html = "<ul>";
        data.forEach(t => {
            html += `<li>
                <strong>${t.timestamp}</strong><br>
                Alt: ${t.altitude}m | Temp: ${t.temperature}°C | Press: ${t.pressure} hPa<br>
                Lat: ${t.latitude}, Long: ${t.longitude} | Bat: ${t.battery}%
            </li>`;
        });
        html += "</ul>";
        container.innerHTML = html;

        atualizarGraficos(data);
    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    fetchTelemetries();
    setInterval(fetchTelemetries, 5000);
});
