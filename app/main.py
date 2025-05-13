from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from .database import engine, init_db
from .models import Telemetry
from fastapi import HTTPException
import serial
from .models import Mission

app = FastAPI()

ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

# Iniciar o banco de dados
@app.on_event("startup")
def on_startup():
    init_db()

# Sessão com o banco
def get_session():
    with Session(engine) as session:
        yield session

@app.post("/send_command")
async def send_command():
    try:
        command = "open"
        ser.write(f"{command}\n".encode())
        return JSONResponse(content={
            "status": "success",
            "command": command,
            "message": f"Comando '{command}' enviado para a porta serial."
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/telemetries")
def create_telemetry(data: Telemetry, session: Session = Depends(get_session)):
    session.add(data)
    session.commit()
    session.refresh(data)
    return data

@app.get("/telemetries")
def list_telemetries(session: Session = Depends(get_session)):
    return session.exec(select(Telemetry)).all()


@app.get("/telemetries/latest")
def latest_telemetry(session: Session = Depends(get_session)):
    result = session.exec(select(Telemetry).order_by(Telemetry.id.desc())).first()
    if result:
        return result
    raise HTTPException(status_code=404, detail="Nenhuma telemetria encontrada")

# Servir frontend
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
