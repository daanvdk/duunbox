from channels.generic.websocket import AsyncJsonWebsocketConsumer


class GameConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        code = self.scope['url_route']['kwargs']['code']
        try:
            player = self.scope['session'][f'game_{code}']
        except KeyError:
            await self.close()

        self.groups = [f'game_{code}', f'player_{player}']
        for group in self.groups:
            await self.channel_layer.group_add(group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for group in self.groups:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def game_update(self, event):
        await self.send_json(event)

    async def game_message(self, event):
        await self.send_json(event)
