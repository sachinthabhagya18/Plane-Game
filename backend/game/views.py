from rest_framework import generics
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from .serializers import PasswordResetConfirmSerializer, RegisterSerializer, UserSerializer, WithdrawalRequestSerializer
from .models import Bet, GameHistory, Profile, GameSettings, WithdrawalRequest, GameRound,ProfitSettlement
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .serializers import GameHistorySerializer
from .models import GameHistory, SiteVisit
from .serializers import GameHistorySerializer, SiteVisitSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    def patch(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        data = request.data
        if 'phone_number' in data: profile.phone_number = data['phone_number']
        if 'beneficiary_name' in data: profile.beneficiary_name = data['beneficiary_name']
        if 'bank_name' in data: profile.bank_name = data['bank_name']
        if 'branch_name' in data: profile.branch_name = data['branch_name']
        if 'account_number' in data: profile.account_number = data['account_number']
        profile.save()
        return Response({"message": "Profile Updated Successfully!", "user": UserSerializer(user).data})

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def public_settings(request):
    settings_obj, _ = GameSettings.objects.get_or_create(id=1)
    return Response({"restrict_desktop": settings_obj.restrict_desktop})

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def player_withdrawal(request):
    if request.method == 'GET':
        withdrawals = WithdrawalRequest.objects.filter(user=request.user).order_by('-request_date')
        serializer = WithdrawalRequestSerializer(withdrawals, many=True)
        return Response(serializer.data)
    if request.method == 'POST':
        amount = float(request.data.get('amount', 0))
        if amount <= 0: return Response({"error": "Invalid amount"}, status=400)
        profile = request.user.profile
        if float(profile.balance) < amount: return Response({"error": "Insufficient balance"}, status=400)
        profile.balance = float(profile.balance) - amount
        profile.save()
        bank_info = f"Name: {profile.beneficiary_name} | Bank: {profile.bank_name} | Branch: {profile.branch_name} | Acc: {profile.account_number}"
        WithdrawalRequest.objects.create(user=request.user, amount=amount, status='PENDING', bank_details_snapshot=bank_info)
        return Response({"message": "Withdrawal requested!", "new_balance": profile.balance})

# --- ADMIN VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_settings(request):
    settings_obj, _ = GameSettings.objects.get_or_create(id=1)
    if request.method == 'POST':
        settings_obj.force_crash_point = request.data.get('force_crash_point', settings_obj.force_crash_point)
        settings_obj.house_edge = request.data.get('house_edge', settings_obj.house_edge)
        settings_obj.max_win_limit = request.data.get('max_win_limit', settings_obj.max_win_limit)
        settings_obj.restrict_desktop = request.data.get('restrict_desktop', settings_obj.restrict_desktop)
        settings_obj.save()
        return Response({"message": "Settings Saved!"})
    return Response({
        "force_crash_point": settings_obj.force_crash_point,
        "house_edge": settings_obj.house_edge,
        "max_win_limit": settings_obj.max_win_limit,
        "restrict_desktop": settings_obj.restrict_desktop
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    users = User.objects.all().select_related('profile').order_by('-id')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_balance(request):
    user_id = request.data.get('user_id')
    amount = request.data.get('amount')
    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
        profile.balance = float(profile.balance) + float(amount)
        profile.save()
        return Response({"message": "Balance updated"})
    except: return Response({"error": "Failed"}, status=400)



@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_profit_stats(request):
    # 1. Current Active Profit (Not yet cleared)
    # settlement=None වන රවුන්ඩ්ස් වල එකතුව
    current_profit = GameRound.objects.filter(settlement__isnull=True).aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00
    
    # 2. Total All Time Profit
    total_profit = GameRound.objects.aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00
    
    # 3. Total Bets (Active Period)
    current_bets = GameRound.objects.filter(settlement__isnull=True).aggregate(Sum('total_bets'))['total_bets__sum'] or 0.00

    # 4. History (Settlements)
    settlement_history = ProfitSettlement.objects.all().order_by('-created_at').values('id', 'amount', 'created_at')

    return Response({
        "current_profit": float(current_profit),
        "total_profit": float(total_profit),
        "current_bets": float(current_bets),
        "history": list(settlement_history)
    })

# --- NEW: CLEAR PROFIT API ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_clear_profit(request):
    # Calculate current unsettled profit
    unsettled_rounds = GameRound.objects.filter(settlement__isnull=True)
    current_profit = unsettled_rounds.aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00

    if current_profit == 0:
        return Response({"error": "No profit to clear"}, status=400)

    # 1. Create a Settlement Record (History)
    settlement = ProfitSettlement.objects.create(amount=current_profit)

    # 2. Mark all these rounds as 'Settled'
    unsettled_rounds.update(settlement=settlement)

    return Response({
        "message": "Profit Cleared Successfully!",
        "cleared_amount": float(current_profit),
        "date": settlement.created_at
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_withdrawals(request):
    if request.method == 'GET':
        reqs = WithdrawalRequest.objects.all().order_by('-request_date')
        serializer = WithdrawalRequestSerializer(reqs, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        req_id = request.data.get('id')
        action = request.data.get('action')
        try:
            wd_req = WithdrawalRequest.objects.get(id=req_id)
            if wd_req.status != 'PENDING': return Response({"error": "Processed"}, status=400)
            
            if action == 'APPROVE':
                wd_req.status = 'APPROVED'
                wd_req.save()
                return Response({"message": "Approved"})
            
            elif action == 'REJECT':
                wd_req.status = 'REJECTED'
                wd_req.save()
                profile = wd_req.user.profile
                profile.balance = float(profile.balance) + float(wd_req.amount)
                profile.save()
                return Response({"message": "Rejected"})
        except: return Response({"error": "Error"}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            
            # Token එකක් හදනවා
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Reset Link එක (ඔබේ Frontend Domain එක දාන්න)
            reset_link = f"https://127.0.0.1:8000/reset-password?uid={uid}&token={token}"
            
            # ඇත්තටම ඊමේල් යවන්න කලින්, අපි Console එකේ ප්‍රින්ට් කරමු (Testing වලට)
            print(f"========== PASSWORD RESET LINK ==========")
            print(f"User: {user.username}")
            print(f"Link: {reset_link}")
            print(f"=========================================")
            
            # මෙතනට පස්සේ Email යවන කෝඩ් එක දාන්න පුළුවන් (send_mail function එකෙන්)

            return Response({"message": "Password reset link sent to your email (Check Server Console for now)"})
        except User.DoesNotExist:
            # ආරක්ෂාවට අපි කියනවා email එක යැව්වා කියලා, නැත්නම් හැකර්ලාට ඊමේල් හොයන්න පුළුවන්
            return Response({"message": "Password reset link sent to your email"})
    
    return Response(serializer.errors, status=400)

# 2. අලුත් පාස්වර්ඩ් එක දාන API එක
@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        uid = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        password = serializer.validated_data['new_password']
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password reset successful! You can login now."})
            else:
                return Response({"error": "Invalid or expired token"}, status=400)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=400)
            
    return Response(serializer.errors, status=400)


# --- ANALYTICS & STATS ---

@api_view(['GET', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_analytics(request):
    if request.method == 'GET':
        history = GameHistory.objects.all().order_by('-created_at')[:50]
        serializer = GameHistorySerializer(history, many=True)
        return Response(serializer.data)
    if request.method == 'DELETE':
        action = request.data.get('action')
        if action == 'CLEAR_ALL':
            GameHistory.objects.all().delete()
            return Response({"message": "Cleared"})
        rec_id = request.data.get('id')
        if rec_id:
            GameHistory.objects.filter(id=rec_id).delete()
            return Response({"message": "Deleted"})
        return Response({"error": "Invalid"}, status=400)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_profit_stats(request):
    # 1. Current Active Profit (තාම Clear කරලා නැති ලාභය)
    current_profit = GameRound.objects.filter(settlement__isnull=True).aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00
    
    # 2. Total All Time Profit
    total_profit = GameRound.objects.aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00
    
    # 3. Current Bets
    current_bets = GameRound.objects.filter(settlement__isnull=True).aggregate(Sum('total_bets'))['total_bets__sum'] or 0.00

    # 4. History (Settlements)
    history = ProfitSettlement.objects.all().order_by('-created_at').values('id', 'amount', 'created_at')

    return Response({
        "current_profit": float(current_profit), # Frontend එක බලාපොරොත්තු වන අගය
        "total_profit": float(total_profit),
        "current_bets": float(current_bets),
        "history": list(history)
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_clear_profit(request):
    # Settlement එකක් හදලා දැනට තියෙන Active Rounds ටික ඒකට දානවා
    unsettled_rounds = GameRound.objects.filter(settlement__isnull=True)
    current_profit = unsettled_rounds.aggregate(Sum('house_profit'))['house_profit__sum'] or 0.00

    if current_profit == 0:
        return Response({"error": "No profit to clear"}, status=400)

    settlement = ProfitSettlement.objects.create(amount=current_profit)
    unsettled_rounds.update(settlement=settlement)

    return Response({
        "message": "Profit Cleared!",
        "cleared_amount": float(current_profit)
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def record_visit(request): 
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    path = request.data.get('path', '/')
    SiteVisit.objects.create(ip_address=ip, user_agent=user_agent, path=path)
    return Response({"message": "Recorded"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_visitor_stats(request):
    total_visits = SiteVisit.objects.count()
    unique_visitors = SiteVisit.objects.values('ip_address').distinct().count()
    recent_visits = SiteVisit.objects.all().order_by('-timestamp')[:100]
    serializer = SiteVisitSerializer(recent_visits, many=True)
    return Response({
        "total_visits": total_visits,
        "unique_visitors": unique_visitors,
        "recent_visits": serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_player_search(request):
    username = request.query_params.get('username')
    if not username:
        return Response({"error": "Username required"}, status=400)
    
    try:
        user = User.objects.get(username__iexact=username)
        profile = Profile.objects.get(user=user)
        
        total_bets = Bet.objects.filter(user=user).count()
        total_wagered = Bet.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0.00
        total_profit = Bet.objects.filter(user=user, cashed_out=True).aggregate(Sum('profit'))['profit__sum'] or 0.00
        total_lost = Bet.objects.filter(user=user, cashed_out=False).aggregate(Sum('amount'))['amount__sum'] or 0.00
        net_profit = float(total_profit) - float(total_lost)

        last_bets = Bet.objects.filter(user=user).order_by('-created_at')[:20].values(
            'amount', 'cashed_out', 'cashed_out_at', 'profit', 'created_at'
        )

        return Response({
            "found": True,
            "username": user.username,
            "balance": profile.balance,
            "stats": {
                "total_rounds": total_bets,
                "total_wagered": total_wagered,
                "net_profit": net_profit
            },
            "history": list(last_bets)
        })

    except User.DoesNotExist:
        return Response({"found": False, "message": "User not found"})