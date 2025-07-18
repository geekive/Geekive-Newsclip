import uuid
import requests
from bs4 import BeautifulSoup

# -------------------------------------------------------------------
# UID 생성 함수
# -------------------------------------------------------------------
def generate_uid(prefix):
    uid = uuid.uuid4().hex
    return f"{prefix}-{uid}"

# -------------------------------------------------------------------
# URL에서 Open Graph 메타 정보 추출
# -------------------------------------------------------------------
def get_og_information(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    og_site_name_tag = soup.find("meta", property="og:site_name")
    og_title_tag = soup.find("meta", property="og:title")
    og_image_tag = soup.find("meta", property="og:image")                
    og_description_tag = soup.find("meta", attrs={"name": "description"})

    publisher = og_site_name_tag.get("content") if og_site_name_tag else None
    title = og_title_tag.get("content") if og_title_tag else None
    image_url = og_image_tag.get("content") if og_image_tag else None
    description = og_description_tag.get("content") if og_description_tag else None

    return {
        "url": url,
        "publisher": publisher,
        "image_url": image_url,
        "title": title,
        "description": description
    }

# -------------------------------------------------------------------
# SQL 쿼리 내 리스트 파라미터 바인딩
# __NAME__ 부분을 :name_0, :name_1 ... 으로 치환하고 바인딩 dict 생성
# -------------------------------------------------------------------
def bind_array(query: str, name: str, values: list):
    placeholder = ", ".join(f":{name}_{i}" for i in range(len(values)))
    bind = {f"{name}_{i}": v for i, v in enumerate(values)}
    query = query.replace(f"__{name.upper()}__", placeholder)
    return query, bind
