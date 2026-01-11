from django.contrib import admin
from .models import Profile, Bet, GameSettings

# 1. Game Settings (Admin Control Center)
@admin.register(GameSettings)
class GameSettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'house_edge', 'max_win_limit', 'force_crash_point', 'server_seed')
    
    list_editable = ('house_edge', 'max_win_limit', 'force_crash_point')
    
    def has_add_permission(self, request):
        return not GameSettings.objects.exists()

# 2. Player Profiles
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance')
    search_fields = ('user__username',)
    list_editable = ('balance',) 


@admin.register(Bet)
class BetAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'cashed_out', 'cashed_out_at', 'profit', 'created_at')
    list_filter = ('cashed_out', 'created_at')
    ordering = ('-created_at',)