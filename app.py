import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template
from models import get_news_list

app = Flask(__name__)

@app.route("/")
def home():
    news = get_news_list()
    return render_template("index.html", news=news)

if __name__ == "__main__":
    app.run(debug=True)