from django.urls import path
from .views import SignupRequestView,LoginView,ForgotPasswordView,VerifyOTPView,ResendOTPView,ResetPasswordView,VerifyPasswordResetOTPView,ChangePasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/',SignupRequestView.as_view(),name='signup'),
    path('verify-otp/',VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(),name='resend-otp'),
    path('login/',LoginView.as_view(),name='login'),
    path('forgot-password/',ForgotPasswordView.as_view(),name='forgot-password'),
    path('verify-reset-otp/',VerifyPasswordResetOTPView.as_view(),name='verify-reset-otp'),
    path("reset-password/", ResetPasswordView.as_view(), name='reset-password'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
]
