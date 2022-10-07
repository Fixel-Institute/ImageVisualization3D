"""
ASGI config for ImageVisualization3D project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
import json
from pathlib import Path

from django.core.asgi import get_asgi_application

BASE_DIR = Path(__file__).resolve().parent
if os.path.exists(os.path.join(BASE_DIR, '.env')):
    with open(os.path.join(BASE_DIR, '.env'), "r") as file:
        config = json.load(file)
    for key in config.keys():
        os.environ[key] = config[key]

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImageVisualization3D.settings')

application = get_asgi_application()
