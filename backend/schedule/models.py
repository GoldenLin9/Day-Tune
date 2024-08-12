from users.models import User
from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    color = models.CharField(max_length=7)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id}: {self.name} - {self.color}"

class TimeBlock(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")
    category = models.ForeignKey(Category, models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id}: {self.start_time} - {self.end_time} - {self.category.name if self.category else 'No Category'}"