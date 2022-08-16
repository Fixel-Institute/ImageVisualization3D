"""
ASGI config for ImageVisualization3D project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ["SERVER_ADDRESS"] = "visualization.jcagle.solutions"
os.environ["SECRET_KEY"] = "django-unsecure&fdjkshghdfsjaighifdahigf"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImageVisualization3D.settings')

application = get_asgi_application()