from django.contrib import admin
from .models import Goal, Log, Message

# Register your models here.
admin.site.register(Goal)
admin.site.register(Log)
admin.site.register(Message)