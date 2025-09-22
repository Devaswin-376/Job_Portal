from rest_framework import serializers
from .models import User,JobSeekerProfile, EmployerProfile, CompanyProfile

class Registerserializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    
class JobSeekerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source = "user.email", read_only = True)
    name = serializers.CharField(source = "user.name", read_only = True)

    class Meta:
        model = JobSeekerProfile
        fields = ["email", "name", "skills", "qualification", "resume", "profile_picture"]
        extra_kwargs = {
            "resume" : {"required" : False},
            "profile_picture" : {"required" : False}
        }
        
class EmployerProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source="user.email", read_only=True)
    name = serializers.CharField(source = "user.name", read_only=True)
    
    class Meta:
        model = EmployerProfile
        fields = ["email", "name", "company_name", "department" , "designation"]
        
        
class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source = "user.email", read_only = True)
    name = serializers.CharField(source = "user.name", read_only=True)
    
    class Meta:
        model = CompanyProfile
        fields = ["email", "name", "description", "services", "location", "website", "logo"]
        
        
        
