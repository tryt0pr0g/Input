import os

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


#SQLALCHEMY_DATABASE_URL = "postgresql://fastapi_db_po12_user:jco7AciWRN7Zn53oGS51itXuEtH5NlLT@dpg-d3o4oeur433s739pp44g-a/fastapi_db_po12"
# 'postgresql://postgres:root@localhost:5432/KeyboardMaster'


DATABASE_URL = os.getenv("postgresql://fastapi_db_po12_user:jco7AciWRN7Zn53oGS51itXuEtH5NlLT@dpg-d3o4oeur433s739pp44g-a/fastapi_db_po12")

engine = create_engine(DATABASE_URL)
#engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
ModelORM = declarative_base()
meta = MetaData()