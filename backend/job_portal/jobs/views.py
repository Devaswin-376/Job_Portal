from rest_framework import generics, permissions, status, viewsets
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied,ValidationError
from django.utils import timezone
from django.db import IntegrityError
from django.core.mail import send_mail
from django.conf import settings
from .models import JobPost,JobApplication
from .serializers import JobPostSerializer, JobApplicationSerializer
from account.models import JobSeekerProfile
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter,OrderingFilter
from jobs.filters import JobFilter


class JobPostListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.all().order_by("-created_at")
    serializer_class = JobPostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = JobFilter

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
        
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx


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
            application = serializer.save(applicant=user)
        except IntegrityError:
            return Response({"error" : "You have already applied for this job."}, status=400)
        
        job_title = application.job.title
        company_name = application.job.company_name or "the employer"
        
        send_mail(
            subject=f"Application Submitted for {job_title}",
            message=f"Dear {user.name},\n\nYour application for the position '{job_title}' at {company_name} has been successfully submitted.\n\nThank you for applying!\n\nBest regards,\nJob Portal Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        
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
    
    
class JobViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.all().order_by('-created_at')
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_class = JobFilter
    
    search_fields = ['title', 'description', 'location', 'company_name','qualification','experience','salary','created_at']
    
    ordering_fields = ['salary','created_at','title','experience','company_name', 'deadline']
    ordering = ['-created_at']
    
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

    
    
class AcceptApplicationView(generics.UpdateAPIView):
    queryset = JobApplication.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobApplicationSerializer

    def update(self, request, *args, **kwargs):
        application = self.get_object()
        job = application.job

        if request.user != job.posted_by:
            raise PermissionDenied("You are not allowed to accept this application.")

        application.status = JobApplication.STATUS_ACCEPTED
        application.save()

        # ✅ Send email to jobseeker
        send_mail(
            subject=f"Your Application for {job.title} has been Accepted!",
            message=f"Dear {application.applicant.name},\n\nCongratulations! Your application for the job '{job.title}' at {job.company_name or 'the employer'} has been short-listed.\n\nThey may contact you soon for the next steps.\n\nBest wishes,\nJob Portal Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.applicant.email],
            fail_silently=True,
        )

        return Response({"message": "Application accepted and email sent."}, status=200)

    