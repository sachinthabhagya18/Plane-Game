from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, WithdrawalRequest

class UserSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    beneficiary_name = serializers.SerializerMethodField()
    bank_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    account_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'balance', 'is_staff', 'is_superuser', 'phone_number', 'beneficiary_name', 'bank_name', 'branch_name', 'account_number']

    def get_balance(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return float(profile.balance)

    def get_phone_number(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return profile.phone_number
    
    def get_beneficiary_name(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return profile.beneficiary_name

    def get_bank_name(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return profile.bank_name

    def get_branch_name(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return profile.branch_name

    def get_account_number(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return profile.account_number

class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    beneficiary_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    bank_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    branch_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    account_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'phone_number', 'beneficiary_name', 'bank_name', 'branch_name', 'account_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Extract custom fields safely
        phone = validated_data.pop('phone_number', '')
        beneficiary = validated_data.pop('beneficiary_name', '')
        bank = validated_data.pop('bank_name', '')
        branch = validated_data.pop('branch_name', '')
        acc_num = validated_data.pop('account_number', '')

        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        
        # Create Profile with extracted data
        Profile.objects.create(
            user=user, 
            balance=100.00, 
            phone_number=phone,
            beneficiary_name=beneficiary,
            bank_name=bank,
            branch_name=branch,
            account_number=acc_num
        )
        return user

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bank_snapshot = serializers.CharField(source='bank_details_snapshot', read_only=True)
    
    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'user', 'username', 'amount', 'status', 'request_date', 'bank_snapshot']