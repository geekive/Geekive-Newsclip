from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid, bind_array
from datetime import datetime
from sqlalchemy import text
from flask import session as user_session
import os

# 쿼리 로딩
news_sql_path           = os.path.join(os.path.dirname(__file__), "../db/query", "news.sql")
news_sql_map            = load_queries(news_sql_path)
sign_sql_path           = os.path.join(os.path.dirname(__file__), "../db/query", "sign.sql")
sign_sql_map            = load_queries(news_sql_path)
notification_sql_path   = os.path.join(os.path.dirname(__file__), "../db/query", "notification.sql")
notification_sql_map    = load_queries(notification_sql_path)

# -------------------------------------------------------------------
# 뉴스 상세 조회
# -------------------------------------------------------------------
def select_news_detail(data):
    session = get_session()
    try:
        param = {
            "news_uid"      : data.get('news_uid')
            , "user_uid"    : user_session.get('user_uid')
        }
        news = session.execute(news_sql_map["selectNewsDetail"], param)
        return dict(news.mappings().first())
    finally:
        session.close()

# -------------------------------------------------------------------
# 뉴스 기사 리스트 조회
# -------------------------------------------------------------------
def select_article_list(data):
    session = get_session()
    try:
        param = {
            "news_uid"      : data.get('news_uid')
            , "user_uid"    : user_session.get('user_uid')
        }
        result = session.execute(news_sql_map["selectArticleList"], param)
        return [dict(row) for row in result.mappings().all()]
    finally:
        session.close()

# -------------------------------------------------------------------
# 뉴스 등록
# -------------------------------------------------------------------
def insert_news(data):
    session = get_session()
    try:
        news_uid = generate_uid("NWS")
        news_params = {
            "news_uid": news_uid,
            "topic_uid": data.get('topic_uid', '').strip(),
            "title": data.get('title', '').strip(),
            "date": data.get('date', '').strip(),
            "memo": data.get('memo', '').strip(),
            "importance": data.get('importance', '').strip(),
            "registration_date": datetime.now(),
            "registration_user": user_session.get('user_uid')
        }
        session.execute(news_sql_map["insertNews"], news_params)

        article_array = data.get('article_array', [])
        for article in article_array:
            article_param = {
                "article_uid": generate_uid("ATC"),
                "news_uid": news_uid,
                "url": article.get('url'),
                "publisher": article.get('publisher'),
                "title": article.get('title'),
                "image_url": article.get('image_url'),
                "description": article.get('description'),
                "registration_date": datetime.now(),
                "registration_user": user_session.get('user_uid')
            }
            session.execute(news_sql_map["insertArticle"], article_param)

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# -------------------------------------------------------------------
# 뉴스 수정
# -------------------------------------------------------------------
def update_news(data):
    session = get_session()
    try:
        news_uid = data.get('news_uid', '').strip()
        news_params = {
            "news_uid": news_uid,
            "title": data.get('title', '').strip(),
            "date": data.get('date', '').strip(),
            "memo": data.get('memo', '').strip(),
            "importance": data.get('importance', '').strip(),
            "update_date": datetime.now(),
            "update_user": user_session.get('user_uid')
        }
        session.execute(news_sql_map["updateNews"], news_params)

        article_array = data.get('article_array', [])
        existing_uids = [a.get('article_uid') for a in article_array if a.get('article_uid')]

        # 기존 기사 중 삭제된 기사 제거
        sql, bind_params = bind_array(news_sql_map["deleteArticle"].text, "article_uid_list", existing_uids)
        bind_params["news_uid"] = news_uid
        session.execute(text(sql), bind_params)

        # 신규 기사 등록
        for article in article_array:
            if not article.get('article_uid'):
                article_param = {
                    "article_uid": generate_uid("ATC"),
                    "news_uid": news_uid,
                    "url": article.get('url'),
                    "publisher": article.get('publisher'),
                    "title": article.get('title'),
                    "image_url": article.get('image_url'),
                    "description": article.get('description'),
                    "registration_date": datetime.now(),
                    "registration_user": user_session.get('user_uid')
                }
                session.execute(news_sql_map["insertArticle"], article_param)

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        
# -------------------------------------------------------------------
# 뉴스 삭제
# -------------------------------------------------------------------
def delete_news(data):
    session = get_session()
    try:
        news_uid = data.get('news_uid', '').strip()
        news_params = {
            "news_uid"      : news_uid,
            "update_date"   : datetime.now(),
            "update_user"   : user_session.get('user_uid')
        }
        session.execute(news_sql_map["deleteNews"], news_params)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# -------------------------------------------------------------------
# 뉴스 기사 등록
# -------------------------------------------------------------------
def insert_article(data):
    session = get_session()
    try:
        news_uid = data.get('news_uid', '').strip()

        # 신규 기사 등록
        if news_uid:
            article_param = {
                "article_uid": generate_uid("ATC"),
                "news_uid": news_uid,
                "url": data.get('url'),
                "publisher": data.get('publisher'),
                "title": data.get('title'),
                "image_url": data.get('image_url'),
                "description": data.get('description'),
                "registration_date": datetime.now(),
                "registration_user": user_session.get('user_uid')
            }
            session.execute(news_sql_map["insertArticle"], article_param)
            session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# -------------------------------------------------------------------
# 댓글 리스트 조회
# -------------------------------------------------------------------
def select_comment_list(data):
    session = get_session()
    try:
        param = {"news_uid": data.get('news_uid')}
        result = session.execute(news_sql_map["selectCommentList"], param)
        return [dict(row) for row in result.mappings().all()]
    finally:
        session.close()

# -------------------------------------------------------------------
# 댓글 등록
# -------------------------------------------------------------------
def insert_comment(data):
    session = get_session()
    try:
        comment_params = {
            "comment_uid"           : generate_uid("CMT")
            , "news_uid"            : data.get('news_uid')
            , "comment"             : data.get('comment')
            , "registration_date"   : datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            , "registration_user"   : user_session.get('user_uid')
        }
        session.execute(news_sql_map["insertComment"], comment_params)

        notification_params = {
            "ntf_uid"               : generate_uid("NTF")
            , "type"                : "COMMNET"
            , "target_uid"          : data.get('news_uid')
            , "registration_date"   : datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            , "registration_user"   : user_session.get('user_uid')
        }
        useruid_sql = f"(SELECT REGISTRATION_USER FROM NEWS WHERE NEWS_UID = '{data.get('news_uid')}')"
        session.execute(text(notification_sql_map["insertNotification"].text.replace(f"__USER__", useruid_sql)), notification_params)
        
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()