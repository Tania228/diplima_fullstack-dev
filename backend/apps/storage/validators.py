import re
from pathlib import Path


COMMENT_LIMIT = 1000
FORBIDDEN_NAME = re.compile(r'[\\/\x00]')


def clean_original_name(name):
    if not isinstance(name, str):
        return None
    cleaned = Path(name).name.replace('\x00', '').strip()
    if not cleaned or cleaned in {'.', '..'} or FORBIDDEN_NAME.search(cleaned):
        return None
    if len(cleaned) > 255:
        return None
    return cleaned


def clean_comment(comment):
    if comment is None:
        return ''
    if not isinstance(comment, str):
        return None
    comment = comment.strip()
    if len(comment) > COMMENT_LIMIT:
        return None
    return comment
