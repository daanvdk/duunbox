from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync


class GameConsumer(JsonWebsocketConsumer):

    def connect(self):
        code = self.scope['url_route']['kwargs']['code']
        try:
            player = self.scope['session'][f'game_{code}']
        except KeyError:
            self.close()
            return

        self.game_group = f'game_{code}'
        self.player_group = f'player_{player}'

        group_add = async_to_sync(self.channel_layer.group_add)
        group_add(self.game_group, self.channel_name)
        group_add(self.player_group, self.channel_name)

        self.accept()

    def disconnect(self, close_code):
        group_discard = async_to_sync(self.channel_layer.group_discard)
        group_discard(self.game_group, self.channel_name)
        group_discard(self.player_group, self.channel_name)

    def game_update(self, event):
        self.send_json(event)

    def game_message(self, event):
        self.send_json(event)
