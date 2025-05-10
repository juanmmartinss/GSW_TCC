from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from .database import engine, init_db
from .models import Telemetry
from fastapi import HTTPException
from .models import Mission

app = FastAPI()

# Iniciar o banco de dados
@app.on_event("startup")
def on_startup():
    init_db()

# Sessão com o banco
def get_session():
    with Session(engine) as session:
        yield session

@app.post("/commands")
def send_command(command: str, session: Session = Depends(get_session)):
    if command not in ["STOP_TEMPERATURE", "START_TEMPERATURE"]:
        raise HTTPException(status_code=400, detail="Comando inválido")

    return {"status": "success", "command": command}

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
