from django.urls import path, include
from . import views

urlpatterns = [
    path('timeblocks/<str:date_str>/', views.TimeBlockView.as_view(), name='show'),
    path('timeblocks/', views.TimeBlockView.as_view(), name='show'),
    path('category/<int:category_id>/', views.CategoryView.as_view(), name='category'),
    path('category/', views.CategoryView.as_view(), name='category'),
]