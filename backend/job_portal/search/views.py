from rest_framework.views import APIView
from rest_framework.response import Response
from jobs.models import JobPost
from account.models import EmployerProfile, JobSeekerProfile,CompanyProfile
from jobs.serializers import JobPostSerializer
from account.serializers import EmployerProfileSerializer, JobSeekerProfileSerializer,CompanyProfileSerializer

class GlobalSearchView(APIView):
    def get(self, request):
        query = request.GET.get('q', '')
        job_results = JobPost.objects.filter(title__icontains=query) | JobPost.objects.filter(description__icontains=query) | JobPost.objects.filter(company_name__icontains=query)|JobPost.objects.filter(location__icontains=query)
        employer_results = EmployerProfile.objects.filter(company_name__icontains=query)
        jobseeker_results = JobSeekerProfile.objects.filter(user__name__icontains=query)
        company_results = CompanyProfile.objects.filter(user__name__icontains=query)|CompanyProfile.objects.filter(location__icontains=query)
        
        jobs_data = JobPostSerializer(job_results, many=True).data
        employers_data = EmployerProfileSerializer(employer_results, many=True).data
        seekers_data = JobSeekerProfileSerializer(jobseeker_results, many=True).data
        company_data = CompanyProfileSerializer(company_results, many=True).data

        return Response({
            "jobs": jobs_data,
            "employers": employers_data,
            "jobseekers": seekers_data,
            "companys" : company_data 
        })
