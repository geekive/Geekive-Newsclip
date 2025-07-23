from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
from flask import session as user_session
import os

# 쿼리 로딩
topic_sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "topic.sql")
topic_sql_map = load_queries(topic_sql_path)

interest_sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "interest.sql")
interest_sql_map = load_queries(interest_sql_path)

# -------------------------------------------------------------------
# 토픽 조회
# -------------------------------------------------------------------
def select_topic():
    session = get_session()
    result = session.execute(topic_sql_map["selectTopic"])
    session.close()
    return result.fetchall()


# -------------------------------------------------------------------
# 토픽 등록
# -------------------------------------------------------------------
def insert_topic(topic_name):
    session = get_session()
    try:
        user_uid    = user_session.get('user_uid')
        topic_uid   = generate_uid("TPC")

        # TOPIC 테이블에 데이터 저장
        topic_params = {
            "topic_uid"             : topic_uid
            , "topic_name"          : topic_name
            , "registration_date"   : datetime.now()
            , "registration_user"   : user_uid
        }
        session.execute(topic_sql_map["insertTopic"], topic_params)

        # INTEREST 테이블에 최상단 순서로 데이터 저장 후 재정렬
        interest_param = {
            "user_uid"      : user_uid
            , "topic_uid"   : topic_uid
        }
        session.execute(topic_sql_map["insertNewTopicIntoInterest"], interest_param)
        session.execute(interest_sql_map["cleanInterestOrder"], interest_param)
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
        session.execute(topic_sql_map["deleteTopic"], {"topic_uid": topic_uid})
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
