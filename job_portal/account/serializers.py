from rest_framework import serializers
from .models import User,JobSeekerProfile, EmployerProfile, CompanyProfile, Follow

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
        
        
class UserListSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "followers_count", "following_count"]

    def get_followers_count(self, obj):
        # Count how many users are following this user
        return obj.follower.count()

    def get_following_count(self, obj):
        # Count how many users this user is following
        return obj.following.count()
        
class FollowSerializer(serializers.ModelSerializer):
    follower_name = serializers.CharField(source = "follower.name", read_only=True)
    following_name = serializers.CharField(source = "following.name", read_only = True)
    
    class Meta:
        model = Follow
        fields = [
            "id", "follower","follower_name","following","following_name","created_at"
        ]
        read_only = ["id", "follower" ,"follower_name", "created_at"]
