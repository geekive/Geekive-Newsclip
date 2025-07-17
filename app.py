import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify
from model.timeline_model import select_timeline_list
from model.news_model import get_news_list, insert_news
from model.topic_model import insert_topic, delete_topic
from util.util import get_og_information

app = Flask(__name__)

@app.route("/")
def home():
    news = get_news_list()
    return render_template("index.html", news=news)

@app.route("/timeline/list", methods=['POST'])
def row_list():    
    timeline_list = select_timeline_list()
  

    return render_template("timeline.html", timeline_list=timeline_list)

@app.route("/timeline/template", methods=['POST'])
def topic_template():
    return render_template("timeline.html")

@app.route("/topic/save", methods=['POST'])
def topic_save():
    data = request.get_json()
    topic_name = data.get('topic_name', '').strip()

    if not topic_name:
        return jsonify({
            'resultCode': 'fail'
            , 'resultMessage' : '토픽 데이터가 없습니다.'})
    
    topic_uid = insert_topic(topic_name)
    return jsonify({
        'resultCode': 'success'
        , 'resultMessage' : '토픽이 저장되었습니다.'
        , 'data' : {
            'topic_uid' : topic_uid
        }
    })

@app.route("/topic/delete", methods=['POST'])
def topic_delete():
    data = request.get_json()
    topic_uid = data.get('topic_uid', '').strip()

    if not topic_uid:
        return jsonify({
            'resultCode': 'fail'
            , 'resultMessage' : '토픽 데이터가 없습니다.'})
    
    delete_topic(topic_uid)
    return jsonify({
        'resultCode': 'success'
        , 'resultMessage' : '토픽이 삭제되었습니다.'})

@app.route("/news/save", methods=['POST'])
def news_save():
    data = request.get_json()
    insert_news(data)
    return jsonify({
        'resultCode': 'success'
        , 'resultMessage' : '토픽이 저장되었습니다.'
        })

@app.route("/news/web-scraping", methods=['POST'])
def new_web_scraping():
    data    = request.get_json()
    url     = data.get('url', '').strip()
    og      = get_og_information(url)
    html    = render_template("modal/news_url.html", og = og)
    return jsonify({
        'code'        : 'success'
        , 'message'   : '토픽이 저장되었습니다.'
        , 'data'      : html
        })

if __name__ == "__main__":
    app.run(debug=True)

