import random
import os
import bcrypt
from db.connection import get_session
from util.sql_loader import load_queries
from util.util import generate_uid, send_email
from datetime import datetime
from flask import render_template


# 쿼리 로딩
sql_path = os.path.join(os.path.dirname(__file__), "../db/query", "sign.sql")
sql_map = load_queries(sql_path)

# -------------------------------------------------------------------
# 닉네임 중복 확인
# -------------------------------------------------------------------
def check_nickname(data):
    session = get_session()
    try:
        param   = {"nickname": data.get('nickname', '').strip()}
        result  = session.execute(sql_map["checkNickname"], param).fetchone()
        count   = result[0] if result else 0
        return count > 0
    finally:
        session.close()

# -------------------------------------------------------------------
# 이메일 중복 확인
# -------------------------------------------------------------------
def check_email(data):
    session = get_session()
    try:
        param   = {"email": data.get('email', '').strip()}
        result  = session.execute(sql_map["checkEmail"], param).fetchone()
        count   = result[0] if result else 0
        return count > 0
    finally:
        session.close()

# -------------------------------------------------------------------
# 인증 코드 발송
# -------------------------------------------------------------------
def send_code_mail(data):
    session = get_session()
    try:
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        email   = data.get('email', '').strip()
        subject = 'Newsclip | 인증코드를 확인하세요!'
        content = render_template("email/code.html", code=code)
        send_email(email, subject, content)

        return code
    except Exception:
        raise

# -------------------------------------------------------------------
# 회원 가입
# -------------------------------------------------------------------
def insert_user(data):
    session = get_session()
    try:
        user_uid = generate_uid("USR")
        password = data.get('password', '').strip()
        password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        user_params = {
            "user_uid"              : user_uid
            , "nickname"            : data.get('nickname', '').strip()
            , "email"               : data.get('email', '').strip()
            , "password"            : password
            , "registration_date"   : datetime.now()
            , "registration_user"   : user_uid
        }
        session.execute(sql_map["insertUser"], user_params)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()