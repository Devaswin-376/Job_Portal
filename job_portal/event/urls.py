# events/urls.py
from django.urls import path
from .views import EventListCreateView, EventDetailView, EventImageDeleteView

urlpatterns = [
    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("images/<int:pk>/delete/", EventImageDeleteView.as_view(), name="event-image-delete"),
]
