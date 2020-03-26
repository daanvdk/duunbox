from django.test import TestCase, Client

from is_valid import is_str
from is_valid.test import assert_valid


class RoomTests(TestCase):

    def test_lobby(self):
        client_foo = Client()
        client_bar = Client()

        # Foo can create
        res = client_foo.post(
            '/api/room/',
            content_type='application/json',
            data={
                'name': 'Foo',
            },
        )
        self.assertEqual(res.status_code, 200)
        assert_valid(res.json(), {
            'code': is_str,
            'game': None,
            'started': False,
            'players': [
                {'name': 'Foo', 'admin': True, 'self': True},
            ],
        })
        code = res.json()['code']

        # Foo can view
        res = client_foo.get(f'/api/room/{code}/')
        self.assertEqual(res.status_code, 200)
        assert_valid(res.json(), {
            'code': is_str,
            'game': None,
            'started': False,
            'players': [
                {'name': 'Foo', 'admin': True, 'self': True},
            ],
        })

        # Bar can join
        res = client_bar.post(
            f'/api/room/{code}/join/',
            content_type='application/json',
            data={
                'name': 'Bar',
            },
        )
        self.assertEqual(res.status_code, 200)
        assert_valid(res.json(), {
            'code': is_str,
            'game': None,
            'started': False,
            'players': [
                {'name': 'Foo', 'admin': True, 'self': False},
                {'name': 'Bar', 'admin': False, 'self': True},
            ],
        })

        # Foo can see bar
        res = client_foo.get(f'/api/room/{code}/')
        self.assertEqual(res.status_code, 200)
        assert_valid(res.json(), {
            'code': is_str,
            'game': None,
            'started': False,
            'players': [
                {'name': 'Foo', 'admin': True, 'self': True},
                {'name': 'Bar', 'admin': False, 'self': False},
            ],
        })

        # Bar can view
        res = client_bar.get(f'/api/room/{code}/')
        self.assertEqual(res.status_code, 200)
        assert_valid(res.json(), {
            'code': is_str,
            'game': None,
            'started': False,
            'players': [
                {'name': 'Foo', 'admin': True, 'self': False},
                {'name': 'Bar', 'admin': False, 'self': True},
            ],
        })
