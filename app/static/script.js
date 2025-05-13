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
        body: JSON.stringify({}) // O comando é fixo no backend
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


// Configuração dos gráficos para Giroscópio e Acelerômetro
let gyroChart = new Chart(document.getElementById("gyroChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Giroscópio (rad/s)",
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

let accelChart = new Chart(document.getElementById("accelChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Acelerômetro (m/s²)",
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

// Função para inicializar o 3D com o Three.js
let scene, camera, renderer, cylinder;

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 400);
    document.getElementById("canSat3D").appendChild(renderer.domElement);

    let geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);

    camera.position.z = 5;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Função para atualizar a rotação do cilindro
function updateCylinderOrientation(yaw, pitch, roll) {
    cylinder.rotation.x = pitch;
    cylinder.rotation.y = yaw;
    cylinder.rotation.z = roll;
}

// Chama a função para inicializar a cena 3D
init3D();

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
        
        // Inverter a ordem para adicionar a mais recente primeiro
        data.reverse().forEach(t => {
            html += `<li>
                <strong>${t.timestamp}</strong><br>
                <b>Temp:</b> ${t.temperature}°C | <b>Hum:</b> ${t.humidity}%<br>
                <b>Giroscópio:</b> ${t.gyx}, ${t.gyy}, ${t.gyz} rad/s | 
                <b>Acelerômetro:</b> ${t.acx}, ${t.acy}, ${t.acz} m/s²<br>
                <b>Lat:</b> ${t.latitude}, <b>Long:</b> ${t.longitude} | <b>Bat:</b> ${t.battery}%
            </li>`;

            // Atualiza os gráficos de giroscópio e acelerômetro
            const label = new Date(t.timestamp).toLocaleTimeString();

            if (gyroChart.data.labels.length >= 10) {
                gyroChart.data.labels.shift();
                accelChart.data.labels.shift();
                gyroChart.data.datasets[0].data.shift();
                accelChart.data.datasets[0].data.shift();
            }

            gyroChart.data.labels.push(label);
            accelChart.data.labels.push(label);
            gyroChart.data.datasets[0].data.push(t.gyx);
            accelChart.data.datasets[0].data.push(t.acx);
        });

        html += "</ul>";
        container.innerHTML = html;

        // Atualiza localização
        const ultima = data[0]; 
        document.getElementById("localizacao").textContent =
            `Lat: ${ultima.latitude}, Long: ${ultima.longitude}`;

        gyroChart.update();
        accelChart.update();

        // Atualiza a rotação do cilindro com os dados do giroscópio
        updateCylinderOrientation(ultima.gyy, ultima.gyx, ultima.gyz);

    } catch (err) {
        console.error("Erro ao buscar telemetrias:", err);
    }
}

// Chama a função para atualizar as telemetrias a cada 2 segundos (2000 ms)
setInterval(fetchTelemetries, 2000);

document.addEventListener("DOMContentLoaded", fetchTelemetries);

