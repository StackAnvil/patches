"""Write redacted HTTP summaries while mitmproxy captures private flows."""

import json
import os
import sys
from pathlib import Path

from mitmproxy import http

sys.path.insert(0, str(Path(__file__).parent))
from capture_redact import redact_body, redact_headers, redact_path

EVENTS = Path(os.environ["STACKANVIL_CAPTURE_EVENTS"])


def response(flow: http.HTTPFlow) -> None:
    request = flow.request
    reply = flow.response
    if reply is None:
        return
    event = {
        "time": request.timestamp_start,
        "method": request.method,
        "host": request.pretty_host.casefold(),
        "path": redact_path(request.path),
        "protocol": request.http_version,
        "request_headers": redact_headers(request.headers),
        "request_body": redact_body(request.content or b"", request.headers.get("content-type", "")),
        "status": reply.status_code,
        "response_headers": redact_headers(reply.headers),
        "response_body": redact_body(reply.content or b"", reply.headers.get("content-type", "")),
    }
    descriptor = os.open(EVENTS, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o600)
    with os.fdopen(descriptor, "a", encoding="utf8") as file:
        file.write(json.dumps(event, separators=(",", ":")) + "\n")
