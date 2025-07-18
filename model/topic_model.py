from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
import os

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "topic.sql")
sql_map = load_queries(sql_path)


# -------------------------------------------------------------------
# 토픽 조회
# -------------------------------------------------------------------
def select_topic():
    session = get_session()
    result = session.execute(sql_map["selectTopic"])
    session.close()
    return result.fetchall()


# -------------------------------------------------------------------
# 토픽 등록
# -------------------------------------------------------------------
def insert_topic(topic_name):
    session = get_session()
    try:
        topic_uid = generate_uid("TPC")
        params = {
            "topic_uid": topic_uid,
            "topic_name": topic_name,
            "registration_date": datetime.now(),
            "registration_user": "system",
        }
        session.execute(sql_map["insertTopic"], params)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
    return topic_uid


# -------------------------------------------------------------------
# 토픽 삭제
# -------------------------------------------------------------------
def delete_topic(topic_uid):
    session = get_session()
    try:
        session.execute(sql_map["deleteTopic"], {"topic_uid": topic_uid})
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
