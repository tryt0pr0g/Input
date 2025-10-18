import os

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:root@localhost:5432/KeyboardMaster'



# DATABASE_URL = os.getenv("DATABASE_URL")
#
# engine = create_engine(DATABASE_URL)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
ModelORM = declarative_base()
meta = MetaData()