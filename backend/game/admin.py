from django.contrib import admin
from .models import Profile, Bet, GameSettings

# 1. Game Settings (Admin Control Center)
@admin.register(GameSettings)
class GameSettingsAdmin(admin.ModelAdmin):
    # ලිස්ට් එකේ පෙන්වන දේවල්
    list_display = ('id', 'house_edge', 'max_win_limit', 'force_crash_point', 'server_seed')
    
    # ලිස්ට් එකේ ඉඳන්ම වෙනස් කරන්න පුළුවන් දේවල් (Quick Edit)
    list_editable = ('house_edge', 'max_win_limit', 'force_crash_point')
    
    # Settings එකක් විතරක් තියාගන්න (වැරදිලා අලුත් ඒවා හදන එක වළක්වයි)
    def has_add_permission(self, request):
        # දැනටමත් Setting එකක් තියෙනවා නම් අලුත් එකක් හදන්න දෙන්න එපා
        return not GameSettings.objects.exists()

# 2. Player Profiles
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance')
    search_fields = ('user__username',)
    list_editable = ('balance',) # Admin ට කෙලින්ම Balance එක වෙනස් කරන්න පුළුවන්

# 3. Bets History
@admin.register(Bet)
class BetAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'cashed_out', 'cashed_out_at', 'profit', 'created_at')
    list_filter = ('cashed_out', 'created_at')
    ordering = ('-created_at',) # අලුත් Bets උඩින්ම පෙන්වන්න