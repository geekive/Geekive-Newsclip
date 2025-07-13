from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.config import Config

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, echo=Config.SQLALCHEMY_ECHO)
session = sessionmaker(bind=engine)

def get_session():
    return session()