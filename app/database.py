from sqlmodel import SQLModel, create_engine

DATABASE_URL = "postgresql://admin:secret@db:5432/telemetry"

engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)
