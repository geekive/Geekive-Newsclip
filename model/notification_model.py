from db.connection import get_session
from util.sql_loader import load_queries
from flask import session as user_session
import os

# 쿼리 로딩
notification_sql_path   = os.path.join(os.path.dirname(__file__), "../db/query", "notification.sql")
notification_sql_map    = load_queries(notification_sql_path)

# -------------------------------------------------------------------
# 알림 조회
# -------------------------------------------------------------------
def select_notification():
    session = get_session()
    try:
        params = {"user_uid": user_session.get('user_uid')}
        notification = session.execute(notification_sql_map["selectNotification"], params)
        return [dict(row._mapping) for row in notification]
    finally:
        session.close()
