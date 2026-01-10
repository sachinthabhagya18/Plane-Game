from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=100.00)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    
    # --- FULL BANKING DETAILS ---
    beneficiary_name = models.CharField(max_length=150, null=True, blank=True) # ගිණුම් හිමියාගේ නම
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    branch_name = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.user.username

class GameSettings(models.Model):
    house_edge = models.FloatField(default=10.0)
    max_win_limit = models.FloatField(default=5000.0)
    force_crash_point = models.FloatField(default=0.0)
    server_seed = models.CharField(max_length=255, default="secret_seed")
    restrict_desktop = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Game Setting"

class Bet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    cashed_out = models.BooleanField(default=False)
    cashed_out_at = models.FloatField(null=True, blank=True)
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

class WithdrawalRequest(models.Model):
    STATUS_CHOICES = (('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'))
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    request_date = models.DateTimeField(auto_now_add=True)
    bank_details_snapshot = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount}"