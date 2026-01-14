from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostListCreateView,JobPostDetailView,JobApplicationCreateView,JobApplicationListView,MyApplicationView,JobViewSet,AcceptApplicationView

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')

urlpatterns = [
    path("<int:pk>/", JobPostDetailView.as_view(), name="job-detail"),
    path("<int:job>/apply/", JobApplicationCreateView.as_view(), name="job-apply"),
    path("<int:job_id>/applications/", JobApplicationListView.as_view(), name="job-applications"),
    path("my-application/", MyApplicationView.as_view(),name="my-application"),
    path("applications/<int:pk>/accept/", AcceptApplicationView.as_view(), name="accept-application"),
    path("",include(router.urls)),
]
