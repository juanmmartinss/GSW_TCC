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
    acx: int  # Acelerômetro no eixo X
    acy: int  # Acelerômetro no eixo Y
    acz: int  # Acelerômetro no eixo Z
    gyx: int  # Giroscópio no eixo X
    gyy: int  # Giroscópio no eixo Y
    gyz: int  # Giroscópio no eixo Z
    temperature: float  # Temperatura
    humidity: float     # Umidade
