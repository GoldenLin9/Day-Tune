
from email import utils
import random
from django.utils.translation import gettext as _
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from .models import ValidationCode, User

from djoser.email import PasswordResetEmail

class EmailReminder:

    def __init__(self, user):
        self.user = user
    
    def sendReminder(self):
        name = self.user.first_name
        email = self.user.email

        context = {
            'name': name,
        }

        subject = _("Email reminder")
        message = render_to_string('email_reminder.html', context)

        send_mail(
            subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            html_message=message
        )
        

class ActivationEmail:

    def __init__(self, user, context):
        self.user = user
        self.context = context

    
    def send(self, to):
        code = ''.join(str(random.randint(0, 9)) for _ in range(6))


        user_data = self.context.get('user')

        ValidationCode.objects.create(
            user=user_data,
            code=code
        ).save()

        context = {
            'first_name: ': user_data.first_name,
            'code': code,
            'site_name': settings.SITE_NAME
        }

        subject = _("Account activation on {site_name}").format(site_name=settings.SITE_NAME)
        message = render_to_string('activation_code.html', context)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            to,
            fail_silently=False
        )


class PasswordResetEmail(PasswordResetEmail):

    def __init__(self, user, context):
        super().__init__()
        self.user = user
        self.context = context


    def get_context_data(self):
        context = super().get_context_data()
        context.update(self.context)

        user = context.get('user')

        context["first_name"] = user.first_name

        return context
    

    def send(self, to):

        context = self.get_context_data()
        context.update(self.context)


        print("MY CONTEXT: ", context)

        subject = _("Password reset on {site_name}").format(site_name=settings.SITE_NAME)
        message = render_to_string('password_reset.html', context)
        send_mail(
            subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            to,
            fail_silently=False,
            html_message=message
        )

        

    
