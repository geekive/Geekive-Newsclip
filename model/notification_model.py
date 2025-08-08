from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid, bind_array
from datetime import datetime
from sqlalchemy import text
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

# -------------------------------------------------------------------
# 알림 읽음 처리
# -------------------------------------------------------------------
def update_notification_read(data):
    session = get_session()
    try:
        notification_uid_array = data.get('notification_uid_array', [])
        sql, bind_params = bind_array(notification_sql_map["updateNotificationRead"].text, "notification_uid_list", notification_uid_array)
        session.execute(text(sql), bind_params)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# -------------------------------------------------------------------
# 알림 삭제
# -------------------------------------------------------------------
def delete_notification(data):
    session = get_session()
    try:
        notification_uid_array = data.get('notification_uid_array', [])
        sql, bind_params = bind_array(notification_sql_map["deleteNotification"].text, "notification_uid_list", notification_uid_array)
        session.execute(text(sql), bind_params)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# -------------------------------------------------------------------
# 알림 등록
# -------------------------------------------------------------------
def insert_notification(type, target_uid):
    session = get_session()
    try:
        # 사용자가 많지 않아 모두에게 알림을 준다.
        user_result = session.execute(notification_sql_map["selectAllUserUid"], {"user_uid" : user_session.get('user_uid')})
        user_list   = user_result.fetchall()
        user_list   = [dict(row._mapping) for row in user_list]
        for user in user_list:
            notification_params = {
                "notification_uid"      : generate_uid("NTF")
                , "user_uid"            : user.get('user_uid')
                , "type"                : type
                , "target_uid"          : target_uid
                , "registration_date"   : datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                , "registration_user"   : user_session.get('user_uid')
            }
            session.execute(notification_sql_map["insertNotification"], notification_params)

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
