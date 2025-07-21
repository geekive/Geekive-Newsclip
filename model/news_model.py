from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid, bind_array
from datetime import datetime
from sqlalchemy import text
from flask import session as user_session
import os

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "news.sql")
sql_map = load_queries(sql_path)

# -------------------------------------------------------------------
# 뉴스 목록 조회
# -------------------------------------------------------------------
def get_news_list():
    session = get_session()
    result = session.execute(sql_map["selectNews"])
    session.close()
    return result.fetchall()

# -------------------------------------------------------------------
# 뉴스 상세 조회
# -------------------------------------------------------------------
def select_news_detail(data):
    session = get_session()
    try:
        param = {"news_uid": data.get('news_uid')}
        news = session.execute(sql_map["selectNewsDetail"], param)
        return dict(news.mappings().first())
    finally:
        session.close()

# -------------------------------------------------------------------
# 뉴스 기사 리스트 조회
# -------------------------------------------------------------------
def select_article_list(data):
    session = get_session()
    try:
        param = {"news_uid": data.get('news_uid')}
        result = session.execute(sql_map["selectArticleList"], param)
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
        session.execute(sql_map["insertNews"], news_params)

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
            session.execute(sql_map["insertArticle"], article_param)

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
            "update_user": "system"
        }
        session.execute(sql_map["updateNews"], news_params)

        article_array = data.get('article_array', [])
        existing_uids = [a.get('article_uid') for a in article_array if a.get('article_uid')]

        # 기존 기사 중 삭제된 기사 제거
        sql, bind_params = bind_array(sql_map["deleteArticle"].text, "article_uid_list", existing_uids)
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
                    "registration_user": "system"
                }
                session.execute(sql_map["insertArticle"], article_param)

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
