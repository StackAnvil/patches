"""Remove account data from Bedrock HTTP capture summaries."""

import json
import re
from urllib.parse import urlsplit

SAFE_PATH_SEGMENTS = frozenset({
    "api", "activities", "assets", "club", "clubs", "details", "events", "favorites",
    "feed", "followers", "friendrequests", "friends", "games", "hub", "invites",
    "join", "members", "messages", "multiplayer", "people", "personas", "presence",
    "profiles", "realms", "recommendations", "recent", "requests", "sessions",
    "settings", "social", "stories", "timeline", "users", "worlds", "me", "v1", "v2",
})
SAFE_ENUM_KEYS = frozenset({
    "action", "joinability", "platform", "privacy", "role", "state", "status", "type", "visibility",
})
SAFE_HEADERS = frozenset({
    "accept", "content-type", "x-xbl-contract-version", "x-realms-version",
})


def redact_path(path: str) -> str:
    parsed = urlsplit(path)
    segments = []
    for segment in parsed.path.split("/"):
        lowered = segment.casefold()
        segments.append(segment if lowered in SAFE_PATH_SEGMENTS else ("<value>" if segment else ""))
    query = "?" + "&".join(f"{key}=<value>" for key in sorted(set(
        re.findall(r"(?:^|&)([^=&]+)=", parsed.query)
    ))) if parsed.query else ""
    return "/".join(segments) + query


def redact_json(value: object, key: str = "", depth: int = 0) -> object:
    if depth >= 12:
        return "<nested>"
    if isinstance(value, dict):
        return {str(field): redact_json(item, str(field), depth + 1) for field, item in value.items()}
    if isinstance(value, list):
        return {"count": len(value), "items": [redact_json(item, key, depth + 1) for item in value[:2]]}
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return "<number>"
    if value is None:
        return None
    if isinstance(value, str) and key.casefold() in SAFE_ENUM_KEYS and re.fullmatch(r"[A-Za-z_-]{1,32}", value):
        return value
    return "<string>"


def redact_body(content: bytes, content_type: str) -> object:
    if not content:
        return None
    if "json" not in content_type.casefold():
        return {"format": "non-json", "bytes": len(content)}
    try:
        return redact_json(json.loads(content))
    except (ValueError, UnicodeDecodeError):
        return {"format": "invalid-json", "bytes": len(content)}


def redact_headers(headers: object) -> dict[str, str]:
    return {str(key).lower(): str(value) for key, value in headers.items()
            if str(key).lower() in SAFE_HEADERS}
