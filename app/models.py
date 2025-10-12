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
    acx: float
    acy: float
    acz: float
    gyx: float
    gyy: float
    gyz: float
    temperature: float
    humidity: float
    pressure: float
    altitude: float
    dir: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
