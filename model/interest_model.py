from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid, bind_array
from datetime import datetime
from sqlalchemy import text
from flask import session as user_session
import os

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "interest.sql")
sql_map = load_queries(sql_path)

# -------------------------------------------------------------------
# 토픽 조회
# -------------------------------------------------------------------
def select_topic():
    session = get_session()
    try:
        param = {"user_uid": user_session.get('user_uid')}
        topic = session.execute(sql_map["selectTopic"], param)
        return [dict(row._mapping) for row in topic]
    finally:
        session.close()

# -------------------------------------------------------------------
# 관심 토픽 저장
# -------------------------------------------------------------------
def insert_interest(data):
    session = get_session()
    try:
        topic_uid_array = data.get('topic_uid_array', [])
        for topic_uid in topic_uid_array:
            interest_param = {
                "user_uid"      : user_session.get('user_uid')
                , "topic_uid"   : topic_uid
            }
            session.execute(sql_map["insertInterest"], interest_param)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()