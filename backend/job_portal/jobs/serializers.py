from rest_framework import serializers
from .models import JobPost, JobApplication

class JobPostSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source= "posted_by.name", read_only=True)
    applications_count = serializers.SerializerMethodField()
    
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
            "posted_by",
            "posted_by_name",
            "applications_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "posted_by", "posted_by_name",  "applications_count", "created_at", "updated_at"]
        
    def get_applications_count(self, obj):
        if isinstance(obj, JobPost):  
            return obj.applications.count()
        return 0
    
    
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
        ]
        read_only_fields = ["id", "job_title", "applicant",  "applicant_name", "applied_at"]
        
    def create(self, validated_data):
        user = self.context["request"].user
        if user.role != "jobseeker":
            raise serializers.ValidationError("Only jobseekers can apply to jobs.")
        validated_data["applicant"] = user 
        return super().create(validated_data)
    