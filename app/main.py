from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from .database import engine, init_db
from .models import Telemetry

app = FastAPI()

# Iniciar o banco de dados
@app.on_event("startup")
def on_startup():
    init_db()

# Sessão com o banco
def get_session():
    with Session(engine) as session:
        yield session

@app.post("/telemetries")
def create_telemetry(data: Telemetry, session: Session = Depends(get_session)):
    session.add(data)
    session.commit()
    session.refresh(data)
    return data

@app.get("/telemetries")
def list_telemetries(session: Session = Depends(get_session)):
    return session.exec(select(Telemetry)).all()

# Servir frontend
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
