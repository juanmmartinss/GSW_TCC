document.addEventListener('DOMContentLoaded', () => {
    const fetchData = async () => {
        const response = await fetch('/telemetries'); 
        const data = await response.json();

        const dataContainer = document.getElementById('data-container');

        if (data.length === 0) {
            dataContainer.innerHTML = '<p>Nenhum dado encontrado.</p>';
        } else {
            let html = '<ul>';
            data.forEach(telemetry => {
                html += `
                    <li>
                        ID: ${telemetry.id} <br>
                        Missão: ${telemetry.mission_id} <br>
                        Data/Hora: ${telemetry.timestamp} <br>
                        Altitude: ${telemetry.altitude}m <br>
                        Temperatura: ${telemetry.temperature}°C <br>
                        Pressão: ${telemetry.pressure}hPa <br>
                        Latitude: ${telemetry.latitude} <br>
                        Longitude: ${telemetry.longitude} <br>
                        Bateria: ${telemetry.battery}% <br>
                    </li>
                    <hr>
                `;
            });
            html += '</ul>';
            dataContainer.innerHTML = html;
        }
    };

    fetchData(); 
});
