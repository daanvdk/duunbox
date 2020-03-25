from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class GameConsumer(AsyncJsonWebsocketConsumer):

    @database_sync_to_async
    def get_player(self, code):
        return self.scope['session'][f'game_{code}']

    async def connect(self):
        code = self.scope['url_route']['kwargs']['code']
        try:
            player = await self.get_player(code)
        except KeyError:
            await self.close()
            return

        self.groups = [f'game_{code}', f'player_{player}']
        for group in self.groups:
            await self.channel_layer.group_add(group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for group in self.groups:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def game_update(self, event):
        await self.send_json(event)

    async def game_messages(self, event):
        await self.send_json(event)
