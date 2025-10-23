from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse # 1. ADICIONAR StreamingResponse
from sqlmodel import Session, select
from .database import engine, init_db
from .models import Telemetry
from fastapi import HTTPException
import serial
from .models import Mission
import io
import csv

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


@app.get("/telemetries/csv")
def download_telemetries_csv(session: Session = Depends(get_session)):
    """
    Endpoint para baixar todos os dados de telemetria em formato CSV.
    """

    stream = io.StringIO()

    writer = csv.writer(stream)

    headers = list(Telemetry.__fields__.keys())
    writer.writerow(headers)

    telemetries = session.exec(select(Telemetry)).all()

    for telemetry in telemetries:
        row = [getattr(telemetry, header) for header in headers]
        writer.writerow(row)

    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )

    response.headers["Content-Disposition"] = "attachment; filename=telemetria_export.csv"

    return response

app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
