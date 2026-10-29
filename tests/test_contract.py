import json
import unittest
from bbsdoorserver.contract import parse, request_session, validate


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.request = dict(version=1,
            session_id='b9af3368-c2c3-4baa-a415-7ab5908e0f33',
            bbs_id='example', user_id='user-1', door_id='test',
            time_limit_seconds=60, terminal='ansi', drop_format='DOOR.SYS')

    def test_formats_remain_denied(self):
        for fmt in ('DOOR.SYS', 'DORINFO1.DEF', 'DOOR32.SYS'):
            self.request['drop_format'] = fmt
            self.assertEqual(request_session(self.request),
                {'status': 'denied', 'reason': 'execution_not_implemented'})

    def test_invalid_fields(self):
        for field, values in {
            'version': [True, 2, '1'], 'session_id': ['../x', None],
            'door_id': ['../door', 'cmd /c', '', 'x' * 65],
            'user_id': ['name\nadmin', 'é'],
            'time_limit_seconds': [True, 0, 3601, 1.5],
            'terminal': ['html', None], 'drop_format': ['unknown']}.items():
            for value in values:
                with self.subTest(field=field, value=value):
                    bad = dict(self.request, **{field: value})
                    with self.assertRaises(ValueError):
                        validate(bad)

    def test_unknown_missing_and_duplicate_keys(self):
        with self.assertRaises(ValueError):
            validate(dict(self.request, command='cmd.exe'))
        bad = dict(self.request)
        del bad['user_id']
        with self.assertRaises(ValueError):
            validate(bad)
        with self.assertRaises(ValueError):
            parse(json.dumps(self.request)[:-1] + ',"version":1}')

    def test_roundtrip(self):
        self.assertEqual(parse(json.dumps(self.request)), self.request)
