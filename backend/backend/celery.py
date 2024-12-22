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
    'email-reminder': {
        #TODO: Update time delta to an appropriate value in production
        'task': 'users.tasks.email_reminder',
        'schedule': timedelta(days=1), # Schedule every 1 day
    },
}