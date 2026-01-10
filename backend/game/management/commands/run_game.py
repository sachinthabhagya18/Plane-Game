# backend/game/management/commands/run_game.py
from django.core.management.base import BaseCommand
import asyncio
from channels.layers import get_channel_layer
from game.consumers import CrashConsumer

class Command(BaseCommand):
    help = 'Starts the Aviator Game Loop'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting Game Engine...'))
        
        channel_layer = get_channel_layer()
        
        # පැරණි loop = asyncio.get_event_loop() කෑල්ල වෙනුවට
        # පහත පේළිය භාවිතා කරන්න. මෙය අලුත් Python versions සඳහා හරිම ක්‍රමයයි.
        try:
            asyncio.run(CrashConsumer.run_game_loop(channel_layer))
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Game Engine Stopped.'))