from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Mission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    description: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Telemetry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mission_id: int
    timestamp: datetime
    acx: float  # Acelerômetro no eixo X
    acy: float  # Acelerômetro no eixo Y
    acz: float  # Acelerômetro no eixo Z
    gyx: float  # Giroscópio no eixo X
    gyy: float  # Giroscópio no eixo Y
    gyz: float  # Giroscópio no eixo Z
    temperature: float  # Temperatura
    humidity: float     # Umidade
    pressure: float     # Pressão
    altitude: float     # Altitude
    dir: str            # Direção (Ex: NO, S, L)
