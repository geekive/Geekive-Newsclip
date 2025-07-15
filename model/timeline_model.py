from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
import os

sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "timeline.sql")
sql_map = load_queries(sql_path)

def select_timeline_list():
    session = get_session()
    result = session.execute(sql_map["selectTimelineList"])
    session.close()
    return result.fetchall()
