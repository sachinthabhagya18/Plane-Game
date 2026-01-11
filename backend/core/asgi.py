import os
import django
from django.core.asgi import get_asgi_application

# 1. Settings set karanna
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')


django.setup()
django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import game.routing

# 4. App define karanna
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            game.routing.websocket_urlpatterns
        )
    ),
})
