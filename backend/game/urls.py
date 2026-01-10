from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# admin_withdrawals import කර ඇති බව තහවුරු කරගන්න
from .views import (
    RegisterView, CurrentUserView, UserDetailView,
    admin_settings, admin_users_list, admin_add_balance,
    public_settings, player_withdrawal, admin_withdrawals 
)

urlpatterns = [
    # Auth & User
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', CurrentUserView.as_view(), name='current_user'),
    
    # Player Features
    path('api/withdraw/', player_withdrawal, name='player_withdrawal'),
    path('api/public/settings/', public_settings, name='public_settings'),

    # Admin Panel Endpoints
    path('api/admin/settings/', admin_settings, name='admin_settings'),
    path('api/admin/users/', admin_users_list, name='admin_users_list'),
    path('api/admin/add-balance/', admin_add_balance, name='admin_add_balance'),
    
    # *** මේ URL එක නැති නිසා තමයි Login වෙන්න දෙන්නේ නැත්තේ ***
    path('api/admin/withdrawals/', admin_withdrawals, name='admin_withdrawals'),
]