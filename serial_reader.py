import serial
import requests
import json
from datetime import datetime

PORTA_SERIAL = "/dev/ttyUSB0"  # Ajuste a porta conforme necessário
BAUD_RATE = 115200
URL_API = "http://localhost:8000/telemetries"

ser = serial.Serial(PORTA_SERIAL, BAUD_RATE, timeout=1)
print("Lendo dados da serial...")

# Função para limpar valores e converter em int
def safe_int(value):
    return int(value.strip().strip('"'))

def parse_telemetry(data):
    # "Temp: 30.50C, Hum: 58.00% | AcX: 420 AcY: -160 AcZ: 17744 | GyX: -23 GyY: -308 GyZ: 149"
    parts = data.split("|")
    if len(parts) < 3:
        raise ValueError("Pacote incompleto ou mal formatado")

    # Extrair dados do acelerômetro
    acx = safe_int(parts[1].split("AcX:")[1].split()[0])
    acy = safe_int(parts[1].split("AcY:")[1].split()[0])
    acz = safe_int(parts[1].split("AcZ:")[1].split()[0])
    
    # Extrair dados do giroscópio
    gyx = safe_int(parts[2].split("GyX:")[1].split()[0])
    gyy = safe_int(parts[2].split("GyY:")[1].split()[0])
    gyz = safe_int(parts[2].split("GyZ:")[1].split()[0])
    
    # Extrair dados de temperatura e umidade
    temperature = float(parts[0].split("Temp:")[1].split("C")[0].strip())
    humidity = float(parts[0].split("Hum:")[1].split("%")[0].strip())
    
    return {
        "mission_id": 1,  # Defina uma missão válida ou padrão
        "timestamp": datetime.utcnow().isoformat(),
        "acx": acx,
        "acy": acy,
        "acz": acz,
        "gyx": gyx,
        "gyy": gyy,
        "gyz": gyz,
        "temperature": temperature,
        "humidity": humidity
    }

while True:
    try:
        linha = ser.readline().decode("utf-8").strip()
        if linha:
            print("Recebido:", linha)
            telemetry_data = parse_telemetry(linha)
            r = requests.post(URL_API, json=telemetry_data)
            print("Enviado:", r.status_code)
    except Exception as e:
        print("Erro:", e)

