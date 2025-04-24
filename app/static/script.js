
// Alternância entre seções
document.getElementById("btnComandos").addEventListener("click", () => {
    document.getElementById("comandosSection").style.display = "block";
    document.getElementById("telemetriasSection").style.display = "none";
});

document.getElementById("btnTelemetrias").addEventListener("click", () => {
    document.getElementById("telemetriasSection").style.display = "block";
    document.getElementById("comandosSection").style.display = "none";
});

// Simular envio de comando
function enviarComando() {
    const comando = document.getElementById("commandDropdown").value;
    const resposta = document.getElementById("respostaComando");
    resposta.textContent = `Comando '${comando}' enviado com sucesso!`;
}

// Carregar telemetrias a cada 5 segundos
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
    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
};

setInterval(fetchTelemetries, 5000);
document.addEventListener("DOMContentLoaded", fetchTelemetries);
