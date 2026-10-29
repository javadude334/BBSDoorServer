import json
import re
import uuid

FIELDS = {'version', 'session_id', 'bbs_id', 'user_id', 'door_id',
          'time_limit_seconds', 'terminal', 'drop_format'}


def validate(request):
    if type(request) is not dict or set(request) != FIELDS:
        raise ValueError('Unexpected or missing fields')
    if type(request['version']) is not int or request['version'] != 1:
        raise ValueError('Unsupported version')
    sid = request['session_id']
    if type(sid) is not str or str(uuid.UUID(sid)) != sid:
        raise ValueError('Invalid session ID')
    for field in ('bbs_id', 'user_id', 'door_id'):
        value = request[field]
        if type(value) is not str or not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', value):
            raise ValueError('Invalid opaque identifier')
    limit = request['time_limit_seconds']
    if type(limit) is not int or not 1 <= limit <= 3600:
        raise ValueError('Invalid time limit')
    if request['terminal'] not in ('ansi', 'ascii'):
        raise ValueError('Unsupported terminal')
    if request['drop_format'] not in ('DOOR.SYS', 'DORINFO1.DEF', 'DOOR32.SYS'):
        raise ValueError('Unsupported drop format')
    return dict(request)


def parse(text):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('Duplicate JSON key')
            result[key] = value
        return result
    return validate(json.loads(text, object_pairs_hook=unique))


def request_session(request):
    validate(request)
    return {'status': 'denied', 'reason': 'execution_not_implemented'}
