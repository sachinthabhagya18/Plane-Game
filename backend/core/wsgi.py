import os
import django
from django.core.asgi import get_asgi_application

# 1. Settings කියන්න
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 2. Django Setup කරන්න (මෙය අනිවාර්යයි)
django.setup()

# 3. Application එක initialize කරන්න
django_asgi_app = get_asgi_application()

# ---------------------------------------------------------
# IMPORT BLOCK
# මේවා import කරන්න ඕනේ django.setup() එකට පස්සේ විතරයි.
# ---------------------------------------------------------
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import game.routing

# 4. Application Definition
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            game.routing.websocket_urlpatterns
        )
    ),
})