from fastapi import APIRouter

router = APIRouter()

@router.get("/telemetry")
def get_telemetry():
    return {"status": "ok", "data": []}
