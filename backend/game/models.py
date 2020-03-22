from django.db import models
from django.contrib.postgres.fields import JSONField

from .games import GAMES


class Game(models.Model):

    code = models.TextField(primary_key=True)
    game = models.TextField(
        choices=[(name, name) for name in sorted(GAMES)],
        blank=True, null=True,
    )
    started = models.BooleanField(default=False)
    state = JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Player(models.Model):

    game = models.ForeignKey(
        'Game', on_delete=models.CASCADE,
        related_name='players',
    )
    name = models.TextField()
    admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('game', 'name')]
