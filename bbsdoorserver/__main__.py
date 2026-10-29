import json
import sys
from .contract import parse, request_session


def main():
    if len(sys.argv) != 2:
        print('Usage: python -m bbsdoorserver request.json')
        return 2
    try:
        with open(sys.argv[1], encoding='utf-8') as source:
            text = source.read(16385)
        if len(text) > 16384:
            raise ValueError('Request too large')
        response = request_session(parse(text))
    except (ValueError, OSError, TypeError):
        print('{"status":"denied","reason":"invalid_request"}')
        return 2
    print(json.dumps(response))
    return 3


if __name__ == '__main__':
    sys.exit(main())
