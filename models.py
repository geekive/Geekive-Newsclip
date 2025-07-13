from db.connection import get_session
from util.sql_loader import load_queries
import os

# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "db/query", "news.sql")
sql_map = load_queries(sql_path)

# 데이터 조회
def get_news_list():
    session = get_session()
    result = session.execute(sql_map["selectNews"])
    session.close()
    return result.fetchall()
