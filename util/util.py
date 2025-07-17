import uuid
import requests
from bs4 import BeautifulSoup

def generate_uid(prefix):
    uid = uuid.uuid4().hex
    return f"{prefix}-{uid}"

def get_og_information(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    res     = requests.get(url, headers=headers)
    soup    = BeautifulSoup(res.text, 'html.parser')

    og_site_name_tag    = soup.find("meta", property="og:site_name")
    og_title_tag        = soup.find("meta", property="og:title")
    og_image_tag        = soup.find("meta", property="og:image")                
    og_description_tag  = soup.find("meta", property="og:description")

    publisher       = og_site_name_tag.get("content") if og_site_name_tag else None
    title           = og_title_tag.get("content") if og_title_tag else None
    thumbnail_url   = og_image_tag.get("content") if og_image_tag else None
    description     = og_description_tag.get("content") if og_image_tag else None

    return {
        "publisher"         : publisher
        , "title"           : title
        , "thumbnail_url"   : thumbnail_url
        , "description"     : description
    }