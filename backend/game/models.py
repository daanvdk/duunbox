from django.db import models
from django.contrib.postgres.fields import JSONField
from django.conf import settings


class Room(models.Model):

    code = models.TextField(primary_key=True)
    game = models.TextField(
        choices=[(name, name) for name in settings.INSTALLED_GAMES],
        blank=True, null=True,
    )
    started = models.BooleanField(default=False)
    state = JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Player(models.Model):

    room = models.ForeignKey(
        'Room', on_delete=models.CASCADE,
        related_name='players',
    )
    name = models.TextField()
    admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('room', 'name')]
