from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin,BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import random


class UserManager(BaseUserManager):
    def create_user(self,email,password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self,email,password=None, **extra_fields):
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        return self.create_user(email,password, **extra_fields)
    
    
    
class User(AbstractBaseUser,PermissionsMixin):
    
    ROLE_CHOICES = [
        ("jobseeker", "Job seeker"),
        ("employer" , "Employer"),
        ("company","Company"),
    ]
    
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="jobseeker")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']
    
    objects = UserManager()
    
    def __str__(self):
        return f"{self.name} ({self.role})"
    
class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="jobseeker_profile")
    skills = models.TextField(blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null= True)
    resume = models.FileField(blank=True,null=True,upload_to="resumes/")
    profile_picture = models.ImageField(blank=True, null=True,upload_to="profile_pics/")
    
    def __str__(self):
        return f"JobSeeker : {self.user.name}"
    
class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255,blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, null=True)   
    
    def __str__(self):
        return f"Employer : {self.user.name}"
    
class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="company_profile")
    description = models.TextField(blank=True, null=True)
    services = models.CharField(max_length=255,blank=True,null=True)
    location = models.CharField(max_length=255,blank=True, null= True)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to="company_logos/",blank=True,null=True)
    
    def __str__(self):
        return f"Company : {self.user.name}"
    

class PendingUser(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
      
    
    def __str__(self):
        return self.email



class OTP(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=1)