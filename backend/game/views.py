from rest_framework import generics
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, WithdrawalRequestSerializer
from .models import Profile, GameSettings, WithdrawalRequest, GameRound,ProfitSettlement

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