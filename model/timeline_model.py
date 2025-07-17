from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
import os

sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "timeline.sql")
sql_map = load_queries(sql_path)

def select_timeline_list():
    session = get_session()

    topic_result = session.execute(sql_map["selectTopicList"])
    topic_list = topic_result.fetchall()

    date_result = session.execute(sql_map["selectDateList"])
    date_list = date_result.fetchall()

    news_result = session.execute(sql_map["selectNewsList"])
    news_list = news_result.fetchall()

    session.close()

    # 미리 dict로 변환
    topic_list = [dict(row._mapping) for row in topic_list]
    date_list = [dict(row._mapping) for row in date_list]
    news_list = [dict(row._mapping) for row in news_list]

    # (TOPIC_UID, DATE) => [NEWS, ...]
    from collections import defaultdict
    news_by_topic_date = defaultdict(list)
    for news in news_list:
        key = (news["TOPIC_UID"], news["DATE"])
        news_by_topic_date[key].append(news)

    result_list = []
    for topic in topic_list:
        topic_uid = topic["TOPIC_UID"]

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
