from rest_framework import serializers
from .models import JobPost, JobApplication
from account.models import CompanyProfile

class JobPostSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source= "posted_by.name", read_only=True)
    applications_count = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPost
        fields = [
            "id",
            "title", 
            "description",
            "job_type", 
            "location",
            "salary", 
            "experience",
            "qualification",
            "deadline",
            "is_active",
            "company_name",
            "logo",
            "posted_by",
            "posted_by_name",
            "applications_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "posted_by", "posted_by_name", "logo", "applications_count", "created_at", "updated_at"]
        
    def get_applications_count(self, obj):
        if isinstance(obj, JobPost):  
            return obj.applications.count()
        return 0
    
    def get_logo(self, obj):
        request = self.context.get("request", None)
        
        logo_candidate = None
        if isinstance(getattr(obj, "logo", None), CompanyProfile):
            logo_candidate = getattr(obj.logo, "logo", None)
        else:
            logo_candidate = getattr(obj, "logo", None)
            
            
        if not logo_candidate and getattr(obj.posted_by, "company_profile", None):
            logo_candidate = getattr(obj.posted_by.company_profile, "logo", None)
        
        if not logo_candidate:
            return None
        
        try:
            url = logo_candidate.url
        except Exception:
            return None
        
        return request.build_absolute_uri(url) if request else url
    
    
class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source= "applicant.name", read_only = True)
    job_title = serializers.CharField(source="job.title", read_only =True)
    
    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job",
            "job_title",
            "applicant",
            "applicant_name",
            "cover_letter",
            "resume",
            "applied_at",
            "status",
        ]
        read_only_fields = ["id", "job_title", "applicant",  "applicant_name", "applied_at","status"]
        
    def create(self, validated_data):
        user = self.context["request"].user
        if user.role != "jobseeker":
            raise serializers.ValidationError("Only jobseekers can apply to jobs.")
        validated_data["applicant"] = user 
        return super().create(validated_data)
    