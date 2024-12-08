import os
from celery import Celery
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'delete-expired-codes': {
        'task': 'users.tasks.delete_expired_codes',
        'schedule': 5.0,  # Schedule every 5 seconds
    },
}
