from django.db import models
from users.models import User
import datetime

# Create your models here.

class Goal(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    completed = models.BooleanField(default=False)
    start_date = models.DateField(default=datetime.date.today)
    end_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

    def __str__(self):
        return self.title
    
class Log(models.Model):

    class Performance(models.IntegerChoices):
        BAD = -1
        NEUTRAL = 0
        GOOD = 1

    date = models.DateField()
    performance = models.IntegerField(choices=Performance.choices, default = Performance.NEUTRAL)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.date} - {self.goal.title} - {self.performance}"
    

class Message(models.Model):
    log = models.ForeignKey(Log, on_delete=models.CASCADE)
    text = models.TextField()
    voice_recording = models.FileField(upload_to='voice_recordings/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ai = models.BooleanField()

    def __str__(self):
        return f"{self.log.date} - {self.log.goal.title} - {self.text[:50]}"