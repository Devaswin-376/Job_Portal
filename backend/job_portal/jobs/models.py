from django.db import models
from django.conf import settings
from django.utils import timezone
# Create your models here.

User = settings.AUTH_USER_MODEL


class JobPost(models.Model):
    JOB_TYPES = [
        ("FT", "Full-time"),
        ("PT","Part-time"),
        ("RM","Remote"),
        ("IN","Internship")
    ]
    
    title = models.CharField(max_length=255,blank=True,null=True)
    description = models.TextField(blank=True,null=True)
    job_type = models.CharField(max_length=2,choices=JOB_TYPES,blank=True,null=True)
    location = models.CharField(max_length=255,blank=True,null=True)
    salary = models.IntegerField(blank=True,null=True)
    experience = models.CharField(max_length=255, blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True,null=True)
    deadline = models.DateTimeField()
    
    posted_by = models.ForeignKey(
        User,
        on_delete= models.CASCADE,
        related_name= "jobs_posted"
    )
    
    company_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def is_active(self):
        return self.deadline >= timezone.now()

    
    def __str__(self):
        return f"{self.title} ({self.company_name or 'N/A'})"
    
    
    
    
class JobApplication(models.Model):
    job = models.ForeignKey(JobPost, on_delete= models.CASCADE, related_name= "applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True,null=True)
    resume = models.FileField(upload_to="applications/resumes/", blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("job", "applicant") #Avoids duplicate applications
        
    def __str__(self):
        return f"{self.applicant.name} -> {self.job.title}"
