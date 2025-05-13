# 🛰️ Ground Station Software (GSS) – CanSat Project

This repository contains the **Backend** and **Frontend** applications for the Ground Station of the **CanSat** project, developed using **FastAPI**, **PostgreSQL**, and **JavaScript**. Communication with the satellite is handled via **serial port** using the **LoRa** module.

---

## ⚙️ Features

- 📡 **Telemetry reception:** The station receives telemetry data from the CanSat via LoRa through the serial port and registers it in the API.
- 🎮 **Command transmission:** Commands like `"open"` can be sent to the CanSat via LoRa.
- 🌐 **Web Interface:** Real-time visualization of telemetry data and command transmission through a simple and intuitive web interface.

---

## 🚀 How to Run Locally

Make sure you have Docker and Docker Compose installed. To start the system, run:

```bash
docker-compose up --build
```
Access: http://localhost:8000/
