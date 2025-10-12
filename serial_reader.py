import serial
import requests
import json
import re
from datetime import datetime

PORTA_SERIAL = "/dev/ttyUSB0"  # Ajuste a porta conforme necessário
BAUD_RATE = 115200
URL_API = "http://localhost:8000/telemetries"

ser = serial.Serial(PORTA_SERIAL, BAUD_RATE, timeout=1)
print("Lendo dados da serial...")

def safe_float(value):
    # Remove aspas, espaços e sufixos como 'g' ou 'dps'
    value = value.strip().strip('"').replace('g', '').replace('dps', '')
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def parse_telemetry(data):
    # Formato esperado: "Temp:... | AcX:... | GyX:... | P:... | Dir:... | GPS:..."
    parts = data.split("|")
    if len(parts) < 5:
        raise ValueError(f"Pacote incompleto ou mal formatado. Recebido: {data}")

    # Extrair dados de temperatura e umidade
    temperature = safe_float(parts[0].split("Temp:")[1].split("C")[0].strip())
    humidity = safe_float(parts[0].split("Hum:")[1].split("%")[0].strip())

    # Extrair dados do acelerômetro
    acx = safe_float(parts[1].split("AcX:")[1].split()[0])
    acy = safe_float(parts[1].split("AcY:")[1].split()[0])
    acz = safe_float(parts[1].split("AcZ:")[1].split()[0])

    # Extrair dados do giroscópio
    gyx = safe_float(parts[2].split("GyX:")[1].split()[0])
    gyy = safe_float(parts[2].split("GyY:")[1].split()[0])
    gyz = safe_float(parts[2].split("GyZ:")[1].split()[0])
    
    # Extrair dados de Pressão e Altitude
    pressure = safe_float(parts[3].split("P:")[1].split()[0])
    altitude = safe_float(parts[3].split("A:")[1].split()[0])
    
    # Extrair Direção (Dir)
    direction = parts[4].split("Dir:")[1].strip()

    return {
        "mission_id": 1,
        "timestamp": datetime.utcnow().isoformat(),
        "acx": acx, "acy": acy, "acz": acz,
        "gyx": gyx, "gyy": gyy, "gyz": gyz,
        "temperature": temperature,
        "humidity": humidity,
        "pressure": pressure,
        "altitude": altitude,
        "dir": direction
    }

def extract_telemetry_line(raw_line):
    # Extrai o que está entre aspas
    match = re.search(r'"([^"]+)"', raw_line)
    if match:
        return match.group(1)
    return None

while True:
    try:
        linha = ser.readline().decode("utf-8", errors="ignore").strip()
        if linha:
            print("Recebido:", linha)
            telemetry_line = extract_telemetry_line(linha)
            if telemetry_line:
                # Checa se os campos essenciais existem antes de tentar o parse
                if all(k in telemetry_line for k in ["Temp:", "Hum:", "AcX:", "GyX:", "P:", "A:", "Dir:"]):
                    try:
                        telemetry_data = parse_telemetry(telemetry_line)
                        r = requests.post(URL_API, json=telemetry_data)
                        print(f"Enviado para API. Status: {r.status_code}")
                    except Exception as e:
                        print(f"Erro ao processar pacote de telemetria: {e}")
                else:
                    print("Linha ignorada: Faltam campos essenciais na telemetria.")
            else:
                print("Linha ignorada: sem dados de telemetria entre aspas.")
    except Exception as e:
        print(f"Erro geral no loop: {e}")
