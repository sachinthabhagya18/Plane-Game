import os
import django
from django.core.asgi import get_asgi_application

# 1. Settings set karanna
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 2. Django Setup (MEKA ANIWARYAI)
django.setup()
django_asgi_app = get_asgi_application()

# 3. Dan imports karanna (Django ready nisa awulak na)
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
