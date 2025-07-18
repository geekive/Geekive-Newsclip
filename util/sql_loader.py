from sqlalchemy import text

# -------------------------------------------------------------------
# SQL 쿼리 파일을 읽고, 이름별로 쿼리를 분리하여 딕셔너리로 반환
# -------------------------------------------------------------------
def load_queries(file_path):
    queries = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = content.split('-- name:')
    for block in blocks:
        if not block.strip():
            continue
        lines = block.strip().splitlines()
        name = lines[0].strip()
        query = '\n'.join(lines[1:]).strip()
        queries[name] = text(query)

    return queries
