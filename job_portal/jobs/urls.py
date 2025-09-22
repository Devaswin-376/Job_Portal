from django.urls import path
from .views import JobPostListCreateView,JobPostDetailView,JobApplicationCreateView,JobApplicationListView,MyApplicationView

urlpatterns = [
    path("", JobPostListCreateView.as_view(), name="job-list-create"),
    path("<int:pk>/", JobPostDetailView.as_view(), name="job-detail"),
    path("<int:job>/apply/", JobApplicationCreateView.as_view(), name="job-apply"),
    path("<int:job_id>/applications/", JobApplicationListView.as_view(), name="job-applications"),
    path("my-application/", MyApplicationView.as_view(),name="my-application")
]
