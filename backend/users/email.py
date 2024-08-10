
import random
from django.utils.translation import gettext as _
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from .models import ValidationCode, User

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