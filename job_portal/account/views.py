#from django.shortcuts import render
import random
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.parsers import MultiPartParser,FormParser,JSONParser
from rest_framework import status
from .models import User,OTP,PendingUser
from .serializers import (
    Registerserializer,
    JobSeekerProfileSerializer,
    EmployerProfileSerializer,
    CompanyProfileSerializer,
)



User = get_user_model()


class SignupRequestView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = Registerserializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        email = serializer.validated_data["email"]
        name = serializer.validated_data['name']
        password = serializer.validated_data["password"]
        role = serializer.validated_data["role"]
        
        #temporarly saving data in PendingUser
        PendingUser.objects.update_or_create(
            email = email,
            defaults={"name":name,"password":password, "role" :role},
            )
        
        
        otp_code = str(random.randint(100000, 999999))
        OTP.objects.create(email = email ,otp_code = otp_code)

        
        subject = "Zecser job portal otp for sign up"
        message = f"Your OTP for sign up is {otp_code}.It expires in 1 minute."
        send_mail(subject,message,None,[email])
        
        return Response({
            "message" : f"OTP sent to {email}"
        }, status=status.HTTP_200_OK)
        

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")
        
        try:
            otp_obj = OTP.objects.filter(
                email=email,
                otp_code=otp_code).latest('created_at')
        except OTP.DoesNotExist:
            return Response({
                "error" : "Invalid OTP"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp_obj.is_expired():
            return Response({
                "error" : "OTP expired"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try : 
            pending_user = PendingUser.objects.get(email = email)
        except PendingUser.DoesNotExist:
            return Response({"error" : "No pending registration for this email "}, status=status.HTTP_400_BAD_REQUEST)
            
        otp_obj.is_verified = True
        otp_obj.save()
        
        
        user = User.objects.create_user(
            email= email,
            name=pending_user.name,
            password= pending_user.password,
            role = pending_user.role,
        )
        
        pending_user.delete()
        
        return Response({
            "message" : "User Registered Successfully"
        }, status=status.HTTP_201_CREATED)
        
        
            
class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self,request):
        email = request.data.get("email")
        last_otp = OTP.objects.filter(email=email).order_by('-created_at').first()
        if last_otp and timezone.now() < last_otp.created_at + timedelta(seconds=30):
            return Response({
                "error" : "Please wait before requesting a new OTP"
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
        otp_code = str(random.randint(100000,999999))
        OTP.objects.create(email=email,otp_code=otp_code)
        
        subject = "Zecser job portal otp for sign up"
        message = f"Your OTP for sign up is {otp_code}.It expires in 1 minute."
        send_mail(subject,message,None,[email])
         
        return Response({
            "message" : f"New OTP sent to {email}",
        }, status=status.HTTP_200_OK)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["name"] = user.name
        token["role"] = user.role
        return token
    
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid email or password. Please try again.")

        return data

    
    
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer
    
    
    
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "error": "No account with this email"
                },status=status.HTTP_404_NOT_FOUND)
        
        otp_code = str(random.randint(100000, 999999))
        OTP.objects.create(email = email ,otp_code = otp_code)
        
        subject = "Password Reset Request"
        message = f" Your OTP for password reset is :{otp_code}.It expires in 1 minute."
        send_mail(subject,message,None,[email])
        
        return Response({
            "message" : f"OTP for password reset has been sent to {email}"
        }, status=status.HTTP_200_OK)
        

class VerifyPasswordResetOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")
        
        try :
            otp_obj = OTP.objects.filter(
                email=email,
                otp_code=otp_code
            ).latest("created_at")
            
        except OTP.DoesNotExist:
            return Response({
                "error" : "Invalid OTP"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp_obj.is_expired():
            return Response({
                "error" : "OTP expired"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        otp_obj.is_verified = True
        otp_obj.save()
        
        return Response({
                "message" : "OTP for password reset verified successfully "
            }, status=status.HTTP_200_OK)
    

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        
        try : 
            otp_obj = OTP.objects.filter(email=email, is_verified=True).latest("created_at")
        except OTP.DoesNotExist:
            return Response({
                "error" : "OTP not verified for this email"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                "error" : "Passwords do not match.Enter correct same password"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try :
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
        except User.DoesNotExist:
            return Response({
                "error" : "No account with this email"
            }, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            "message" : "Password has been changed successfully"
        }, status=status.HTTP_200_OK)
        
        
        
class ChangePasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.user
        
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        
        if not user.check_password(old_password):
            return Response({
                "error" : "Old password is incorrect"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if new_password != confirm_password:
            return Response({
                "error" : "New passwords do not match"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        
        return Response({
            "messsage" : "Password changed successfully"
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        user = request.user
        if user.role == "jobseeker":
            serializer = JobSeekerProfileSerializer(user.jobseeker_profile)
        elif user.role == "employer":
            serializer = EmployerProfileSerializer(user.employer_profile)
        else :
            serializer = CompanyProfileSerializer(user.company_profile)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        if user.role == "jobseeker":
            profile = user.jobseeker_profile
            serializer = JobSeekerProfileSerializer(profile,data=request.data, partial=True)
            data = request.data.copy()
            if "resume" not in data:
                data["resume"] = profile.resume
            if "profile_picture" not in data:
                data["profile_picture"] = profile.profile_picture
                
        elif user.role == "employer":
            profile = user.employer_profile
            serializer = EmployerProfileSerializer(profile, data=request.data, partial=True)
        else :
            profile = user.company_profile
            serializer = CompanyProfileSerializer(profile, data=request.data, partial=True)
            
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
