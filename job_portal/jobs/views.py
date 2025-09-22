from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied,ValidationError
from django.utils import timezone
from django.db import IntegrityError
from .models import JobPost,JobApplication
from .serializers import JobPostSerializer, JobApplicationSerializer
from account.models import JobSeekerProfile


class JobPostListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.all().order_by("-created_at")
    serializer_class = JobPostSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ["employer", "company"]:
            return Response(
                {"error": "Only employers or companies can post jobs."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        user = self.request.user
        company_name = None
        
        if user.role == "company":
            company_name = user.name
        elif user.role == "employer":
            employer_profile = getattr(user,"employer_profile", None)
            company_name = employer_profile.company_name if employer_profile else None

        serializer.save(posted_by = user, company_name=company_name)


class JobPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        job = self.get_object()
        if self.request.user != job.posted_by:
            return PermissionDenied("You cannot update this job.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.posted_by:
            return PermissionDenied("You cannot delete job.")
        instance.delete()
        

class JobApplicationCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self,request, *args, **kwargs):
        user = self.request.user
        
        if user.role != "jobseeker":
            return Response({"error" : "Only jobseekers can apply."},status=403)
        
        serializer = self.get_serializer(data= request.data)
        serializer.is_valid(raise_exception=True)
        
        resume_file = serializer.validated_data.get("resume")
        
        if not resume_file:
            try:
                profile = JobSeekerProfile.objects.get(user=user)
                if profile.resume:   # if jobseeker already uploaded in profile
                    serializer.validated_data["resume"] = profile.resume
            except JobSeekerProfile.DoesNotExist:
                pass  # no profile → skip (resume stays null)
        
        try:
            serializer.save(applicant=user)
        except IntegrityError:
            return Response({"error" : "You have already applied for this job."}, status=400)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
        
class JobApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        try:
            job = JobPost.objects.get(id=job_id)
        except JobPost.DoesNotExist:
            return JobApplication.objects.none()
        
        if self.request.user == job.posted_by:
            return job.applications.all()
        
        return JobApplication.objects.none()
    
    
class MyApplicationView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).order_by("-applied_at")
    