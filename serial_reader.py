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
    value = str(value).strip().strip('"')
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def parse_telemetry(data):
    # Formato esperado: "Temp:... | AcX:... | GyX:... | P:... | Dir:... | Lat:... Lng:..."
    parts = data.split("|")
    if len(parts) < 6: # Agora esperamos 6 partes
        raise ValueError(f"Pacote incompleto ou mal formatado. Recebido: {data}")

    # Extrações existentes (sem alteração)
    temperature = safe_float(parts[0].split("Temp:")[1].split("C")[0])
    humidity = safe_float(parts[0].split("Hum:")[1].split("%")[0])
    acx = safe_float(parts[1].split("AcX:")[1].split()[0])
    acy = safe_float(parts[1].split("AcY:")[1].split()[0])
    acz = safe_float(parts[1].split("AcZ:")[1].split()[0])
    gyx = safe_float(parts[2].split("GyX:")[1].split()[0])
    gyy = safe_float(parts[2].split("GyY:")[1].split()[0])
    gyz = safe_float(parts[2].split("GyZ:")[1].split()[0])    
    pressure = safe_float(parts[3].split("P:")[1].split()[0])
    altitude = safe_float(parts[3].split("A:")[1].split()[0])
    direction = parts[4].split("Dir:")[1].strip()

    # --- LÓGICA ADICIONADA PARA O GPS ---
    gps_part = parts[5].strip()  # "Lat:-22.781884 Lng:-47.595141"
    latitude = None
    longitude = None
    if "Lat:" in gps_part and "Lng:" in gps_part:
        try:
            lat_str = gps_part.split("Lng:")[0].replace("Lat:", "").strip()
            lng_str = gps_part.split("Lng:")[1].strip()
            latitude = safe_float(lat_str)
            longitude = safe_float(lng_str)
        except Exception as e:
            print(f"Erro ao parsear GPS: {e}")

    return {
        "mission_id": 1,
        "timestamp": datetime.utcnow().isoformat(),
        "acx": acx, "acy": acy, "acz": acz,
        "gyx": gyx, "gyy": gyy, "gyz": gyz,
        "temperature": temperature,
        "humidity": humidity,
        "pressure": pressure,
        "altitude": altitude,
        "dir": direction,
        "latitude": latitude,    # Dado novo
        "longitude": longitude   # Dado novo
    }

def extract_telemetry_line(raw_line):
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
                # Checa se os campos essenciais existem, incluindo Lat e Lng
                if all(k in telemetry_line for k in ["Temp:", "Dir:", "Lat:", "Lng:"]):
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
