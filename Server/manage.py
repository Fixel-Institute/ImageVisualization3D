#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImageVisualization3D.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    if sys.argv[1] == "AdminAccount":
        from ImageVisualization3D import wsgi
        from ImageServer import models
        user = models.PlatformUser.objects.create_user(email=sys.argv[2], password=sys.argv[3])
        user.is_admin = True
        user.save()
        
    elif sys.argv[1] == "StandardAccount":
        from ImageVisualization3D import wsgi
        from ImageServer import models
        user = models.PlatformUser.objects.create_user(email=sys.argv[2], password=sys.argv[3])
        user.is_admin = False
        user.save()
        
    else:
        main()
