from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
from flask import session as user_session
import os
from collections import defaultdict

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "timeline.sql")
sql_map = load_queries(sql_path)


# -------------------------------------------------------------------
# 타임라인 리스트 조회
# -------------------------------------------------------------------
def select_timeline_list():
    session = get_session()

    # 주제 목록 조회
    user_uid    = user_session.get("user_uid")
    params      = {"user_uid": user_uid} if user_uid else {}

    sql_key = "selectTopicList" if user_uid else "selectRandomTopicList"
    topic_result = session.execute(sql_map[sql_key], params)
    topic_list = topic_result.fetchall()

    # 날짜 목록 조회
    date_result = session.execute(sql_map["selectDateList"])
    date_list = date_result.fetchall()

    # 뉴스 목록 조회
    news_result = session.execute(sql_map["selectNewsList"])
    news_list = news_result.fetchall()

    session.close()

    # 리스트를 dict 형태로 변환
    topic_list = [dict(row._mapping) for row in topic_list]
    date_list = [dict(row._mapping) for row in date_list]
    news_list = [dict(row._mapping) for row in news_list]

    # (TOPIC_UID, DATE)를 키로 뉴스 리스트 그룹핑
    news_by_topic_date = defaultdict(list)
    for news in news_list:
        key = (news["TOPIC_UID"], news["DATE"])
        news_by_topic_date[key].append(news)

    # 주제별로 날짜 그룹과 뉴스 리스트 매핑
    result_list = []
    for topic in topic_list:
        topic_uid = topic["topic_uid"]

        date_grouped_news = []
        for date in date_list:
            date_str = date["DATE"]
            key = (topic_uid, date_str)

            date_grouped_news.append({
                "DATE": date_str,
                "NEWS_LIST": news_by_topic_date.get(key, [])
            })

        topic["DATE_LIST"] = date_grouped_news
        result_list.append(topic)

    return result_list
