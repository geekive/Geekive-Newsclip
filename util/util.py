import uuid
import requests
import smtplib
from bs4 import BeautifulSoup
from config.config import Config
from email.message import EmailMessage

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

    # 출판사
    og_site_name_tag = soup.find("meta", property="og:site_name")
    publisher = og_site_name_tag.get("content") if og_site_name_tag else None
    
    # 기사 제목
    og_title_tag = soup.find("meta", property="og:title")
    if og_title_tag and og_title_tag.get("content", "").strip():
        title = og_title_tag.get("content")
    else:
        title = soup.title.string.strip() if soup.title and soup.title.string else '(제목을 제공하지 않는 사이트 입니다)'
    
    # 기사 이미지 URL
    og_image_tag = soup.find("meta", property="og:image")   
    image_url = og_image_tag.get("content") if og_image_tag else None
    
    # 기사 내용
    og_description_tag = (soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description"))
    description = og_description_tag.get("content") if og_description_tag else '(내용을 제공하지 않는 사이트 입니다)'

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

# -------------------------------------------------------------------
# GMAIL 전송
# -------------------------------------------------------------------
def send_email(email: str, subject: str, content: str):
    msg             = EmailMessage()
    msg["Subject"]  = subject
    msg["From"]     = Config.MAIL_USERNAME
    msg["To"]       = email
    msg.set_content(content)
    msg.add_alternative(content, subtype="html")

    with smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT) as smtp:
        if Config.MAIL_USE_TLS:
            smtp.starttls()
        smtp.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        smtp.send_message(msg)

    