import sys
import os
import requests
from flask import Flask, render_template, request, jsonify, url_for, session, redirect

# 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 내부 모듈 import
from model.timeline_model import select_timeline_list
from model.news_model import get_news_list, select_news_detail, select_article_list, insert_news, update_news
from model.topic_model import insert_topic, delete_topic
from model.sign_model import check_nickname, check_email, send_code_mail, insert_user, check_user
from model.interest_model import select_topic, insert_interest
from config.config import Config
from util.util import get_og_information

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY

# ------------------------------
# 홈 화면
# ------------------------------
@app.route("/")
def home():
    news = get_news_list()
    return render_template("index.html", news=news)

# ------------------------------
# 타임라인 관련
# ------------------------------
@app.route("/timeline/list", methods=['POST'])
def row_list():
    timeline_list = select_timeline_list()
    return render_template("timeline.html", timeline_list=timeline_list)

@app.route("/timeline/template", methods=['POST'])
def topic_template():
    return render_template("timeline.html")

# ------------------------------
# 토픽 관련
# ------------------------------
@app.route("/topic/save", methods=['POST'])
def topic_save():
    data = request.get_json()
    topic_name = data.get('topic_name', '').strip()

    if not topic_name:
        return jsonify({
            'resultCode': 'fail',
            'resultMessage': '토픽 데이터가 없습니다.'
        })

    topic_uid = insert_topic(topic_name)
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '토픽이 저장되었습니다.',
        'data': {
            'topic_uid': topic_uid
        }
    })

@app.route("/topic/delete", methods=['POST'])
def topic_delete():
    data = request.get_json()
    topic_uid = data.get('topic_uid', '').strip()

    if not topic_uid:
        return jsonify({
            'resultCode': 'fail',
            'resultMessage': '토픽 데이터가 없습니다.'
        })

    delete_topic(topic_uid)
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '토픽이 삭제되었습니다.'
    })

# ------------------------------
# 뉴스 저장/수정/조회
# ------------------------------
@app.route("/news/save", methods=['POST'])
def news_save():
    data = request.get_json()
    insert_news(data)
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '토픽이 저장되었습니다.'
    })

@app.route("/news/edit", methods=['POST'])
def news_edit():
    data = request.get_json()
    update_news(data)
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '뉴스 수정이 완료되었습니다.'
    })

@app.route("/news/detail", methods=['POST'])
def news_detail():
    data = request.get_json()
    news = select_news_detail(data)
    article_list = select_article_list(data)
    news['article_list_html'] = render_template("modal/news_article.html", article_list=article_list)

    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': news
    })

# ------------------------------
# 뉴스 기사 URL 스크랩핑
# ------------------------------
@app.route("/news/article", methods=['POST'])
def news_article():
    data = request.get_json()
    url = data.get('url', '').strip()

    response = requests.post(
        request.host_url.rstrip('/') + url_for('web_scraping'),
        json={'url': url}
    )

    og = response.json()

    return jsonify({
        'code': 'success',
        'message': '',
        'data': render_template("modal/news_article.html", og=og)
    })

# ------------------------------
# OpenGraph 정보 수집용 백엔드 API
# ------------------------------
@app.route("/web-scraping", methods=['POST'])
def web_scraping():
    data = request.get_json()
    url = data.get('url', '').strip()
    og = get_og_information(url)
    return jsonify(og)

# ------------------------------
# 회원가입 관련
# ------------------------------
@app.route("/signup/check/nickname", methods=['POST'])
def signup_check_nickname():
    is_duplicate = check_nickname(request.get_json())

    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': is_duplicate
    })

@app.route("/signup/check/email", methods=['POST'])
def signup_check_email():
    is_duplicate = check_email(request.get_json())

    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': is_duplicate
    })

@app.route("/signup/code", methods=['POST'])
def signup_code():
    code = send_code_mail(request.get_json())

    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': code
    })

@app.route("/signup/save", methods=['POST'])
def signup_save():
    user_uid = insert_user(request.get_json())
    session['user_uid'] = user_uid
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '회원가입을 축하합니다!\n관심 토픽 창으로 이동합니다.',
        'data': ''
    })

# ------------------------------
# 로그인 / 로그아웃
# ------------------------------
@app.route("/signin", methods=['POST'])
def signin():
    user = check_user(request.get_json())

    if not user:
        return jsonify({
            'resultCode'    : 'fail',
            'resultMessage' : '이메일 또는 비밀번호가 틀렸습니다.',
            'data'          : ''
        })
    
    session['user_uid'] = user.get('user_uid')
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': ''
    })

@app.route("/signed", methods=['POST'])
def signed():
    signed = True if 'user_uid' in session else False
    return jsonify({'signed': signed})

@app.route("/signout", methods=['POST'])
def signout():
    session.clear()
    return '', 204

# ------------------------------
# 관심 토픽 관련
# ------------------------------
@app.route("/interest/topic", methods=['POST'])
def interest_topic():
    topic = select_topic()
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '',
        'data': topic
    })

@app.route("/interest/save", methods=['POST'])
def interest_save():
    data = request.get_json()
    insert_interest(data)
    return jsonify({
        'resultCode': 'success',
        'resultMessage': '관심 토픽이 저장되었습니다.'
    })


# ------------------------------
# 앱 실행
# ------------------------------
if __name__ == "__main__":
    app.run(debug=True)

