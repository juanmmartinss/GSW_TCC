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
    except ValueError:
        return None

def parse_telemetry(data):
    # "Temp: 30.50C, Hum: 58.00% | AcX: 420 AcY: -160 AcZ: 17744 | GyX: -23 GyY: -308 GyZ: 149"
    # 'T:24.10,H:57.00,Ax:0,Ay:0,Az:0,Gx:0,Gy:0,Gz:0,P:949.25,A:546.99´
    parts = data.split("|")
    if len(parts) < 4:
        raise ValueError("Pacote incompleto ou mal formatado")

    # Extrair dados do acelerômetro
    acx = safe_float(parts[1].split("AcX:")[1].split()[0].replace("g", ""))
    acy = safe_float(parts[1].split("AcY:")[1].split()[0].replace("g", ""))
    acz = safe_float(parts[1].split("AcZ:")[1].split()[0].replace("g", ""))
    
    # Extrair dados do giroscópio
    gyx = safe_float(parts[2].split("GyX:")[1].split()[0].replace("dps", ""))
    gyy = safe_float(parts[2].split("GyY:")[1].split()[0].replace("dps", ""))
    gyz = safe_float(parts[2].split("GyZ:")[1].split()[0].replace("dps", ""))    # Extrair dados de temperatura e umidade
    
    temperature = float(parts[0].split("Temp:")[1].split("C")[0].strip())
    humidity = float(parts[0].split("Hum:")[1].split("%")[0].strip())

    pressure =  safe_float(parts[3].split("P:")[1].split()[0])
    altitude = safe_float(parts[3].split("A:")[1].split()[0])
    
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
        "humidity": humidity,
        "pressure": pressure,
        "altitude": altitude
    }

def extract_telemetry_line(raw_line):
    # Extrai o que está entre aspas
    match = re.search(r'"([^"]+)"', raw_line)
    if match:
        return match.group(1)
    return None

while True:
    try:
        linha = ser.readline().decode("utf-8").strip()
        if linha:
            print("Recebido:", linha)
            telemetry_line = extract_telemetry_line(linha)
            if telemetry_line:
                # Agora parseia só a telemetria limpa
                if "Temp:" in telemetry_line and "Hum:" in telemetry_line and "AcX:" in telemetry_line and "GyX:" in telemetry_line and "P:" in telemetry_line and "A:" in telemetry_line:
                    try:
                        telemetry_data = parse_telemetry(telemetry_line)
                        r = requests.post(URL_API, json=telemetry_data)
                        print("Enviado:", r.status_code)
                    except Exception as e:
                        print("Erro ao processar pacote de telemetria:", e)
            else:
                print("Linha ignorada: sem dados de telemetria válidos.")
    except Exception as e:
        print("Erro:", e)
