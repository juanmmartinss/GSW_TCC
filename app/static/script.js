// Alternância entre seções
document.getElementById("btnComandos").addEventListener("click", () => {
    document.getElementById("comandosSection").classList.remove("hidden");
    document.getElementById("telemetriasSection").classList.add("hidden");
});

document.getElementById("btnTelemetrias").addEventListener("click", () => {
    document.getElementById("telemetriasSection").classList.remove("hidden");
    document.getElementById("comandosSection").classList.add("hidden");
});

// Simular envio de comando
function enviarComando() {
    const comando = document.getElementById("commandDropdown").value;
    const resposta = document.getElementById("respostaComando");
    resposta.textContent = `Comando '${comando}' enviado com sucesso!`;
}

// Configuração dos gráficos
let altitudeChart = new Chart(document.getElementById("altitudeChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Altitude (m)",
            data: [],
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            borderColor: "rgba(33, 150, 243, 1)",
            fill: true
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: { y: { beginAtZero: true }, x: { display: false } }
    }
});

let temperatureChart = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Temperatura (°C)",
            data: [],
            backgroundColor: "rgba(244, 67, 54, 0.2)",
            borderColor: "rgba(244, 67, 54, 1)",
            fill: true
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: { y: { beginAtZero: true }, x: { display: false } }
    }
});

let batteryChart = new Chart(document.getElementById("batteryChart"), {
    type: "bar",
    data: {
        labels: ["Bateria"],
        datasets: [{
            label: "Nível de Bateria (%)",
            data: [100],
            backgroundColor: ["rgba(76, 175, 80, 0.6)"]
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    }
});

// Busca e atualiza telemetrias
async function fetchTelemetries() {
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
                <b>Alt:</b> ${t.altitude}m | <b>Temp:</b> ${t.temperature}°C | <b>Press:</b> ${t.pressure} hPa<br>
                <b>Lat:</b> ${t.latitude}, <b>Long:</b> ${t.longitude} | <b>Bat:</b> ${t.battery}%
            </li>`;

            // Atualiza os gráficos
            const label = new Date(t.timestamp).toLocaleTimeString();

            if (altitudeChart.data.labels.length >= 10) {
                altitudeChart.data.labels.shift();
                temperatureChart.data.labels.shift();
                altitudeChart.data.datasets[0].data.shift();
                temperatureChart.data.datasets[0].data.shift();
            }

            altitudeChart.data.labels.push(label);
            temperatureChart.data.labels.push(label);
            altitudeChart.data.datasets[0].data.push(t.altitude);
            temperatureChart.data.datasets[0].data.push(t.temperature);
            batteryChart.data.datasets[0].data = [t.battery];
        });
        html += "</ul>";
        container.innerHTML = html;

        // Atualiza localização
        const ultima = data[data.length - 1];
        document.getElementById("localizacao").textContent =
            `Lat: ${ultima.latitude}, Long: ${ultima.longitude}`;

        altitudeChart.update();
        temperatureChart.update();
        batteryChart.update();
    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
}

document.addEventListener("DOMContentLoaded", fetchTelemetries);
