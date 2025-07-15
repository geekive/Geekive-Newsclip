import uuid

def generate_uid(prefix):
    uid = uuid.uuid4().hex
    return f"{prefix}-{uid}"