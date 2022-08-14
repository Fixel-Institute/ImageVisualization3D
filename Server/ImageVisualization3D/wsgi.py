"""
WSGI config for ImageVisualization3D project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ["SERVER_ADDRESS"] = "https://visualization.jcagle.solutions"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImageVisualization3D.settings')

application = get_wsgi_application()
