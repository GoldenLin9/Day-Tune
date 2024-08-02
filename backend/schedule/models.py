from users.models import User
from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    color = models.CharField(max_length=7)

    def __str__(self):
        return self.name

class TimeBlock(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.start_time} - {self.end_time} - {self.category.name}"