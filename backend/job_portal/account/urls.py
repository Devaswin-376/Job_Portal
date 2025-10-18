from django.urls import path
from .views import SignupRequestView,LoginView,ForgotPasswordView,VerifyOTPView,ResendOTPView,ResetPasswordView,VerifyPasswordResetOTPView,ChangePasswordView,ProfileView,FollowersListView,FollowingListView,UserListView,ToggleFollowView,UnfollowView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/',SignupRequestView.as_view(),name='signup'),
    path('verify-otp/',VerifyOTPView.as_view(), name='verify-otp'),#OTP for verify signup
    path('resend-otp/', ResendOTPView.as_view(),name='resend-otp'),#OTP resend
    path('login/',LoginView.as_view(),name='login'),
    
    
    path('forgot-password/',ForgotPasswordView.as_view(),name='forgot-password'),
    path('verify-reset-otp/',VerifyPasswordResetOTPView.as_view(),name='verify-reset-otp'),#OTP for password rest
    path("reset-password/", ResetPasswordView.as_view(), name='reset-password'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('profile/',ProfileView.as_view(),name='user-profile'),#user profile
    
    
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:user_id>/follow/", ToggleFollowView.as_view(), name="toggle-follow"),
    path("users/<int:user_id>/unfollow/", UnfollowView.as_view(), name="unfollow"),
    path("users/<int:user_id>/followers/", FollowersListView.as_view(), name="followers-list"),
    path("users/<int:user_id>/following/", FollowingListView.as_view(), name="following-list"),
] 

