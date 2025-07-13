from sqlalchemy import text

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