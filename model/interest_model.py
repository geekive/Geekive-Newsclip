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
def upsert_interest(data):
    session = get_session()
    try:
        user_uid        = user_session.get('user_uid')
        topic_uid_array = data.get('topic_uid_array', [])

        # 기존 관심토픽 중 삭제된 관심토픽 제거
        sql, bind_params        = bind_array(sql_map["deleteInterest"].text, "topic_uid_list", topic_uid_array)
        bind_params["user_uid"] = user_uid
        session.execute(text(sql), bind_params)

        # 남은 관심토픽 ORDER 재정렬
        session.execute(sql_map["cleanInterestOrder"], {"user_uid" : user_uid})

        # 관심토픽 저장
        for topic_uid in topic_uid_array:
            interest_param = {
                "user_uid"      : user_uid
                , "topic_uid"   : topic_uid
            }
            session.execute(sql_map["insertInterest"], interest_param)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()