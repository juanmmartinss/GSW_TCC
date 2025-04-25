import time
import requests

BASE_URL = "http://localhost:8000"

def send_telemetry():
    telemetry = {
        "mission_id": 1,
        "timestamp": "2025-04-24T12:00:00",
        "altitude": 1000.0,
        "temperature": 25.0,
        "pressure": 1013.25,
        "latitude": -23.5505,
        "longitude": -46.6333,
        "battery": 95.0
    }
    try:
        res = requests.post(f"{BASE_URL}/telemetries", json=telemetry)
        print("Telemetry sent:", res.status_code)
    except Exception as e:
        print("Error sending telemetry:", e)

def listen_for_commands():
    # Simular a recepção de comandos
    while True:
        command = input("Enter command (STOP_TEMPERATURE/START_TEMPERATURE): ")
        if command in ["STOP_TEMPERATURE", "START_TEMPERATURE"]:
            print(f"Command '{command}' received and processed.")
        else:
            print("Invalid command.")

if __name__ == "__main__":
    while True:
        send_telemetry()
        time.sleep(5)