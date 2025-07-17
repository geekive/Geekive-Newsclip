from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid
from datetime import datetime
from bs4 import BeautifulSoup
import os
import requests

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "news.sql")
sql_map = load_queries(sql_path)

# 데이터 조회
def get_news_list():
    session = get_session()
    result = session.execute(sql_map["selectNews"])
    session.close()
    return result.fetchall()

def insert_news(data):
    session = get_session()
    try:
        news_uid = generate_uid("NWS")
        news_params = {
            "news_uid"              : news_uid
            , "topic_uid"           : data.get('topic_uid', '').strip()
            , "title"               : data.get('title', '').strip()
            , "date"                : data.get('date', '').strip()
            , "memo"                : data.get('memo', '').strip()
            , "importance"          : data.get('importance', '').strip()
            , "registration_date"   : datetime.now()
            , "registration_user"   : "system"
        }
        session.execute(sql_map["insertNews"], news_params)

        url_array = data.get('url_array')
        for url in url_array:
            
            if not url:
                continue

            # get ogtag information :: s
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(url, headers=headers)
            soup = BeautifulSoup(res.text, 'html.parser')

            og_site_name_tag = soup.find("meta", property="og:site_name")
            og_title_tag = soup.find("meta", property="og:title")
            og_image_tag = soup.find("meta", property="og:image")
                       
            publisher = og_site_name_tag.get("content") if og_site_name_tag else None
            title = og_title_tag.get("content") if og_title_tag else None
            thumbnail_url = og_image_tag.get("content") if og_image_tag else None
            # get ogtag information :: e

            url_params = {
                "url_uid"               : generate_uid("URL")
                , "news_uid"            : news_uid
                , "url"                 : url
                , "publisher"           : publisher
                , "title"               : title
                , "thumbnail_url"       : thumbnail_url
                , "registration_date"   : datetime.now()
                , "registration_user"   : "system"
            }
            session.execute(sql_map["insertUrl"], url_params)

        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()