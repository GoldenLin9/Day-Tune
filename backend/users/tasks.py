from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from celery.utils.log import get_task_logger

from users.models import ValidationCode
from users.models import User
from users.email import EmailReminder

from django_celery_beat.models import PeriodicTask, IntervalSchedule


logger = get_task_logger(__name__)

@shared_task
def delete_expired_codes():
    logger.info("Deleting expired codes...")

    for code in ValidationCode.objects.all():
        code.delete()
    

    return "Deleted expired codes"

@shared_task
def email_reminder():
    logger.info("Sending email reminders...")

    for user in User.objects.all():
        EmailReminder(user).sendReminder()
    
    return "Email reminders sent"

    