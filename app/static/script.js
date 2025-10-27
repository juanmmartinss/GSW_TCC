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
        headers: { "Content-Type": "application/json" },
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
const baseChartOptions = {
    maintainAspectRatio: false, responsive: true,
    scales: { x: { display: true, ticks: { maxRotation: 0, minRotation: 0 } } },
    animation: { duration: 300 }
};

// Gráficos
let altitudeChart = new Chart(document.getElementById("altitudeChart"), {
    type: "line",
    data: { labels: [], datasets: [{ label: "Altitude (m)", data: [], backgroundColor: "rgba(75, 192, 192, 0.2)", borderColor: "rgba(75, 192, 192, 1)", fill: true, tension: 0.3 }] },
    options: {
        ...baseChartOptions, // Copia as opções básicas
        scales: {
            ...baseChartOptions.scales, // Copia a escala X
            y: { suggestedMin: 0, suggestedMax: 500 } // Define escala Y (ex: 0 a 500m)
        }
    }
});

let temperatureChart = new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: { labels: [], datasets: [{ label: "Temperatura (°C)", data: [], backgroundColor: "rgba(255, 159, 64, 0.2)", borderColor: "rgba(255, 159, 64, 1)", fill: true, tension: 0.3 }] },
    options: {
        ...baseChartOptions, // Copia as opções básicas
        scales: {
            ...baseChartOptions.scales, // Copia a escala X
            y: { suggestedMin: 10, suggestedMax: 40 } // Define escala Y (ex: 10°C a 40°C)
        }
    }
});

let pressureChart = new Chart(document.getElementById("pressureChart"), {
    type: "line",
    data: { labels: [], datasets: [{ label: "Pressão (hPa)", data: [], backgroundColor: "rgba(153, 102, 255, 0.2)", borderColor: "rgba(153, 102, 255, 1)", fill: true, tension: 0.3 }] },
    options: {
        ...baseChartOptions, // Copia as opções básicas
        scales: {
            ...baseChartOptions.scales, // Copia a escala X
            y: { suggestedMin: 980, suggestedMax: 1030 } // Define escala Y (ex: 980 a 1030 hPa)
        }
    }
});


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
        const latestTelemetry = data[0];

        // 1. Atualiza lista de telemetrias em texto (COM NOVOS DADOS - ESTÁ OK)
        let html = "<ul>";
        data.forEach(t => {
            const batVol = t.battery_voltage ? t.battery_voltage.toFixed(2) + 'V' : 'N/A';
            const pktCount = t.packet_count || 'N/A';
            
            html += `<li>
                <strong>${new Date(t.timestamp).toLocaleString('pt-BR')} (Pkt: ${pktCount})</strong><br>
                <b>Temp:</b> ${t.temperature}°C | <b>Hum:</b> ${t.humidity}% | <b>Bat:</b> ${batVol}<br>
                <b>Giroscópio:</b> ${t.gyx}, ${t.gyy}, ${t.gyz} rad/s | 
                <b>Acelerômetro:</b> ${t.acx}, ${t.acy}, ${t.acz} m/s²<br>
                <b>Pressão:</b> ${t.pressure} hPa | <b>Altitude:</b> ${t.altitude} m | <b>Direção:</b> ${t.dir}<br>
            </li>`;
        });
        html += "</ul>";
        container.innerHTML = html;
        
        // =================================================================
        // 2. LÓGICA DE ATUALIZAÇÃO DOS GRÁFICOS (RECOLOCADA)
        // =================================================================
        const MAX_DATA_POINTS = 10;
        const allCharts = [altitudeChart, temperatureChart, pressureChart];
        if (allCharts[0].data.labels.length >= MAX_DATA_POINTS) {
            allCharts.forEach(chart => {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            });
        }
        const label = new Date(latestTelemetry.timestamp).toLocaleTimeString('pt-BR');
        allCharts.forEach(chart => chart.data.labels.push(label));
        altitudeChart.data.datasets[0].data.push(latestTelemetry.altitude);
        temperatureChart.data.datasets[0].data.push(latestTelemetry.temperature);
        pressureChart.data.datasets[0].data.push(latestTelemetry.pressure);
        allCharts.forEach(chart => chart.update());

        // =================================================================
        // 3. LÓGICA DE ATUALIZAÇÃO DO GPS (RECOLOCADA)
        // =================================================================
        const localizacaoP = document.getElementById("localizacao");
        // (Sugestão de melhoria: usar != null para permitir coordenadas 0)
        if (latestTelemetry.latitude != null && latestTelemetry.longitude != null) {
            // Exibe os dados formatados com 6 casas decimais
            localizacaoP.textContent = `Lat: ${latestTelemetry.latitude.toFixed(6)}, Long: ${latestTelemetry.longitude.toFixed(6)}`;
        } else {
            // Caso não existam, exibe uma mensagem de espera
            localizacaoP.textContent = "Aguardando sinal GPS...";
        }

        // --- LÓGICA DE ATUALIZAÇÃO DA BATERIA (NOVO - ESTÁ OK) ---
        const bateriaP = document.getElementById("bateria");
        if (latestTelemetry.battery_voltage) {
            const voltage = latestTelemetry.battery_voltage;
            const percentage = getBatteryPercentage(voltage);

            // Arredonda a porcentagem para o múltiplo de 5 mais próximo (ex: 82% -> 80%, 84% -> 85%)
            const approxPercentage = Math.round(percentage / 5) * 5;

            // Adicionamos um "~" (til) para indicar que é um valor aproximado
            bateriaP.textContent = `${voltage.toFixed(2)}V (~${approxPercentage.toFixed(0)}%)`;
        } else {
            bateriaP.textContent = "Aguardando dados...";
        }

    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
}

setInterval(fetchTelemetries, 2000);
document.addEventListener("DOMContentLoaded", fetchTelemetries);

/**
 * Converte a voltagem da bateria LiPo (3.2V-4.2V) para porcentagem.
 * Assume 4.2V = 100%, 3.2V = 0%.
 */
function getBatteryPercentage(voltage) {
    const minV = 3.2; // Tensão de corte (0%)
    const maxV = 4.2; // Tensão máxima (100%)
    
    if (voltage > maxV) return 100;
    if (voltage < minV) return 0;
    
    // Cálculo linear simples
    const percentage = ((voltage - minV) / (maxV - minV)) * 100;
    return Math.max(0, Math.min(100, percentage)); // Garante que fique entre 0-100
}
