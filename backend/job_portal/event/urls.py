# events/urls.py
from django.urls import path
from .views import EventListCreateView, EventDetailView, EventImageDeleteView, EventReactionView , EventLikeListView, EventDislikeListView, EventCommentListCreateView, EventCommentUpdateDeleteView

urlpatterns = [
    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("images/<int:pk>/delete/", EventImageDeleteView.as_view(), name="event-image-delete"),
    path("<int:event_id>/react/", EventReactionView.as_view(), name="event-react"),
    path("<int:event_id>/likes/", EventLikeListView.as_view(), name="event-likes"),
    path("<int:event_id>/dislikes/", EventDislikeListView.as_view(), name="event-dislikes"),
    path("<int:event_id>/comments/", EventCommentListCreateView.as_view(), name="event-comments"),
    path("<int:event_id>/comments/<int:pk>/", EventCommentUpdateDeleteView.as_view(), name="event-comments-details"),
]
