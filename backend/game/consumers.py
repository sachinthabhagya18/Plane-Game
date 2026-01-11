# import json
# import asyncio
# import hashlib
# import hmac
# import time
# import random
# import jwt
# from django.conf import settings
# from django.contrib.auth.models import User
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from .models import Profile, Bet, GameSettings

# # --- GLOBAL VARIABLES ---
# GAME_RUNNING = False
# CURRENT_MULTIPLIER = 1.00
# GAME_STATUS = "WAITING"
# ACTIVE_BETS = [] 

# # Bot Names
# BOT_NAMES = [
#     "AviatorKing", "LuckyJoe", "SpeedRacer", "SkyHigh", "Winner99", 
#     "ProGamer", "RichKid", "AlphaBet", "CryptoFan", "EagleEye",
#     "SniperX", "MoonBoy", "ElonMusk", "TraderJo", "BigWhale",
#     "LamboSoon", "ToTheMoon", "HodlGang", "NoFear", "EasyMoney",
#     "Shark007", "NinjaBet", "CaptainCool", "FoxTrader", "GoldDigger"
# ]

# class CrashConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         global GAME_RUNNING, ACTIVE_BETS
#         await self.channel_layer.group_add("game_room", self.channel_name)
#         await self.accept()

#         # Connect වූ වහාම දැනට ඉන්න ලිස්ට් එක යවනවා
#         await self.send(text_data=json.dumps({
#             "type": "all_bets_update",
#             "bets": ACTIVE_BETS
#         }))

#         if not GAME_RUNNING:
#             GAME_RUNNING = True
#             print("--- Game Engine Started ---")
#             asyncio.create_task(self.run_game_loop())

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard("game_room", self.channel_name)

#     async def receive(self, text_data):
#         global ACTIVE_BETS
#         data = json.loads(text_data)
#         action = data.get("action")
#         token = data.get("token")

#         if not token: return
#         user = await self.get_user_from_token(token)
#         if not user: return

#         if action == "place_bet":
#             try:
#                 amount = float(data.get("amount"))
#                 success = await self.place_bet(user, amount)
#                 if success:
#                     # REAL PLAYER BET (Structure: Nested in 'bet')
#                     new_bet = {"username": user.username, "amount": amount, "cashedOut": False, "is_bot": False}
#                     ACTIVE_BETS.append(new_bet)
                    
#                     # Frontend එකට යවද්දී 'bet' key එක ඇතුලේ යවන්න ඕනේ
#                     await self.channel_layer.group_send("game_room", {
#                         "type": "player_update",
#                         "action": "new_bet",
#                         "bet": new_bet 
#                     })
#             except: pass

#         elif action == "cash_out":
#             result = await self.cash_out(user)
#             if result:
#                 for bet in ACTIVE_BETS:
#                     if bet["username"] == user.username:
#                         bet["cashedOut"] = True
#                         bet["cashOutAt"] = round(CURRENT_MULTIPLIER, 2)
#                         bet["profit"] = round(result['profit'], 2)
                
#                 await self.channel_layer.group_send("game_room", {
#                     "type": "player_update",
#                     "action": "player_cashed_out",
#                     "username": user.username,
#                     "multiplier": round(CURRENT_MULTIPLIER, 2),
#                     "profit": round(result['profit'], 2)
#                 })

#     # --- GAME LOOP ---
#     async def run_game_loop(self):
#         global CURRENT_MULTIPLIER, GAME_STATUS, ACTIVE_BETS
        
#         while True:
#             # 1. WAITING
#             GAME_STATUS = "WAITING"
#             CURRENT_MULTIPLIER = 1.00
#             ACTIVE_BETS = [] # Clear List
            
#             await self.broadcast_game_state(extra={"action": "clear_bets"})
            
#             # Bots ලා එකතු කිරීම
#             asyncio.create_task(self.simulate_bot_bets())

#             await asyncio.sleep(5) 

#             # 2. GENERATE CRASH
#             crash_point = await self.get_next_crash_point()
#             print(f"--- Next Crash: {crash_point}x ---")

#             # 3. FLYING
#             GAME_STATUS = "FLYING"
#             if crash_point <= 1.00:
#                 CURRENT_MULTIPLIER = 1.00
#                 await self.broadcast_game_state()
#             else:
#                 while CURRENT_MULTIPLIER < crash_point:
#                     await asyncio.sleep(0.1)
#                     CURRENT_MULTIPLIER += 0.01 + (CURRENT_MULTIPLIER * 0.005)
#                     if CURRENT_MULTIPLIER > crash_point: CURRENT_MULTIPLIER = crash_point
                    
#                     await self.check_bot_cashouts()
#                     await self.broadcast_game_state()

#             # 4. CRASHED
#             GAME_STATUS = "CRASHED"
#             await self.broadcast_game_state()
#             await asyncio.sleep(3)

#     # --- BOT LOGIC (FIXED) ---
#     async def simulate_bot_bets(self):
#         global ACTIVE_BETS
#         await asyncio.sleep(0.5)
        
#         if GAME_STATUS != "WAITING": return

#         num_bots = random.randint(12, 20)
#         selected_bots = random.sample(BOT_NAMES, num_bots)

#         for name in selected_bots:
#             if GAME_STATUS != "WAITING": break
#             await asyncio.sleep(random.uniform(0.1, 0.4))
            
#             amount = random.choice([10, 20, 50, 100, 200, 500, 1000])
            
#             # Win Strategy
#             rand_val = random.random()
#             if rand_val < 0.70: target = random.uniform(1.10, 1.50)
#             elif rand_val < 0.90: target = random.uniform(1.50, 3.00)
#             else: target = random.uniform(3.00, 10.00)

#             bot_bet = {
#                 "username": name,
#                 "amount": amount,
#                 "cashedOut": False,
#                 "is_bot": True,
#                 "target_multiplier": target
#             }
#             ACTIVE_BETS.append(bot_bet)
            
#             public_data = {k: v for k, v in bot_bet.items() if k != "target_multiplier"}
            
#             # FIX: Send bot data wrapped in 'bet' key to match Real Player structure
#             await self.channel_layer.group_send("game_room", {
#                 "type": "player_update",
#                 "action": "new_bet",
#                 "bet": public_data 
#             })

#     async def check_bot_cashouts(self):
#         global ACTIVE_BETS
#         for bet in ACTIVE_BETS:
#             if bet.get("is_bot") and not bet["cashedOut"]:
#                 if CURRENT_MULTIPLIER >= bet["target_multiplier"]:
#                     bet["cashedOut"] = True
#                     bet["cashOutAt"] = CURRENT_MULTIPLIER
#                     profit = bet["amount"] * CURRENT_MULTIPLIER - bet["amount"]
#                     bet["profit"] = profit
                    
#                     await self.channel_layer.group_send("game_room", {
#                         "type": "player_update",
#                         "action": "player_cashed_out",
#                         "username": bet["username"],
#                         "multiplier": round(CURRENT_MULTIPLIER, 2),
#                         "profit": round(profit, 2)
#                     })

#     # --- ADMIN/RANDOM LOGIC ---
#     @database_sync_to_async
#     def get_next_crash_point(self):
#         settings_obj = GameSettings.objects.first()
#         if not settings_obj:
#             settings_obj = GameSettings.objects.create(house_edge=10.0, force_crash_point=0.0)

#         if settings_obj.force_crash_point > 1.0:
#             forced = settings_obj.force_crash_point
#             settings_obj.force_crash_point = 0.0
#             settings_obj.save()
#             # Admin forced වුවත් 30.00 ඉක්මවා යා නොහැක
#             return min(forced, 20.00)

#         return self.calculate_random_crash(settings_obj.house_edge, settings_obj.server_seed)

#     def calculate_random_crash(self, house_edge, seed):
#         round_unique = str(time.time())
#         hash_obj = hmac.new(seed.encode(), round_unique.encode(), hashlib.sha256)
#         hex_hash = hash_obj.hexdigest()
#         decimal_val = int(hex_hash[:13], 16)
#         random_number = decimal_val / (2**52)
#         rtp = (100 - house_edge) / 100
#         if random_number == 0: multiplier = 100.00
#         else: multiplier = rtp / random_number
        
#         # --- 30.00x CAP LOGIC (මෙතනින් සීමා කරයි) ---
#         final_multiplier = round(max(1.00, multiplier), 2)
#         if final_multiplier > 20.00:
#             return 20.00
#         return final_multiplier

#     # --- HELPERS ---
#     async def broadcast_game_state(self, extra=None):
#         data = {"type": "send_update", "status": GAME_STATUS, "multiplier": round(CURRENT_MULTIPLIER, 2)}
#         if extra: data.update(extra)
#         await self.channel_layer.group_send("game_room", data)

#     # Standard Handler for group messages
#     async def send_update(self, event): await self.send(text_data=json.dumps(event))
#     async def player_update(self, event): await self.send(text_data=json.dumps(event))

#     @database_sync_to_async
#     def get_user_from_token(self, token):
#         try:
#             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#             return User.objects.get(id=payload['user_id'])
#         except: return None

#     @database_sync_to_async
#     def place_bet(self, user, amount):
#         profile = Profile.objects.get(user=user)
#         if profile.balance >= amount and GAME_STATUS == "WAITING":
#             profile.balance = float(profile.balance) - amount
#             profile.save()
#             Bet.objects.create(user=user, amount=amount)
#             return True
#         return False

#     @database_sync_to_async
#     def cash_out(self, user):
#         if GAME_STATUS == "FLYING":
#             bet = Bet.objects.filter(user=user, cashed_out_at__isnull=True).last()
#             if bet:
#                 settings_obj = GameSettings.objects.first()
#                 max_win = settings_obj.max_win_limit if settings_obj else 5000.0
#                 raw_win = float(bet.amount) * CURRENT_MULTIPLIER
#                 final_win = min(raw_win, max_win)
#                 profit = final_win - float(bet.amount)
#                 bet.cashed_out_at = CURRENT_MULTIPLIER
#                 bet.profit = profit
#                 bet.save()
#                 profile = Profile.objects.get(user=user)
#                 profile.balance = float(profile.balance) + final_win
#                 profile.save()
#                 return {"profit": profit}
#         return None


import json
import asyncio
import hashlib
import hmac
import time
import random
import jwt
from django.conf import settings
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Profile, Bet, GameSettings, GameRound

# --- GLOBAL VARIABLES ---
GAME_RUNNING = False
CURRENT_MULTIPLIER = 1.00
GAME_STATUS = "WAITING"
ACTIVE_BETS = [] 

# Bot Names
BOT_NAMES = [
    "AviatorKing", "LuckyJoe", "SpeedRacer", "SkyHigh", "Winner99", 
    "ProGamer", "RichKid", "AlphaBet", "CryptoFan", "EagleEye",
    "SniperX", "MoonBoy", "ElonMusk", "TraderJo", "BigWhale",
    "LamboSoon", "ToTheMoon", "HodlGang", "NoFear", "EasyMoney",
    "Shark007", "NinjaBet", "CaptainCool", "FoxTrader", "GoldDigger"
]

class CrashConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global GAME_RUNNING, ACTIVE_BETS
        await self.channel_layer.group_add("game_room", self.channel_name)
        await self.accept()

        # Connect - send current list
        await self.send(text_data=json.dumps({
            "type": "all_bets_update",
            "bets": ACTIVE_BETS
        }))

        if not GAME_RUNNING:
            GAME_RUNNING = True
            print("--- Game Engine Started ---")
            asyncio.create_task(self.run_game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("game_room", self.channel_name)

    async def receive(self, text_data):
        global ACTIVE_BETS
        data = json.loads(text_data)
        action = data.get("action")
        token = data.get("token")

        if not token: return
        user = await self.get_user_from_token(token)
        if not user: return

        if action == "place_bet":
            try:
                amount = float(data.get("amount"))
                success = await self.place_bet(user, amount)
                if success:
                    # REAL PLAYER BET
                    new_bet = {"username": user.username, "amount": amount, "cashedOut": False, "is_bot": False}
                    ACTIVE_BETS.append(new_bet)
                    
                    await self.channel_layer.group_send("game_room", {
                        "type": "player_update",
                        "action": "new_bet",
                        "bet": new_bet 
                    })
            except: pass

        elif action == "cash_out":
            result = await self.cash_out(user)
            if result:
                for bet in ACTIVE_BETS:
                    if bet["username"] == user.username:
                        bet["cashedOut"] = True
                        bet["cashOutAt"] = round(CURRENT_MULTIPLIER, 2)
                        bet["profit"] = round(result['profit'], 2)
                
                await self.channel_layer.group_send("game_room", {
                    "type": "player_update",
                    "action": "player_cashed_out",
                    "username": user.username,
                    "multiplier": round(CURRENT_MULTIPLIER, 2),
                    "profit": round(result['profit'], 2)
                })

    # --- GAME LOOP ---
    async def run_game_loop(self):
        global CURRENT_MULTIPLIER, GAME_STATUS, ACTIVE_BETS
        
        while True:
            # 1. WAITING
            GAME_STATUS = "WAITING"
            CURRENT_MULTIPLIER = 1.00
            ACTIVE_BETS = [] # Clear List
            
            await self.broadcast_game_state(extra={"action": "clear_bets"})
            
            # Bots
            asyncio.create_task(self.simulate_bot_bets())

            await asyncio.sleep(5) 

            # 2. GENERATE CRASH
            crash_point = await self.get_next_crash_point()
            print(f"--- Next Crash: {crash_point}x ---")

            # 3. FLYING
            GAME_STATUS = "FLYING"
            if crash_point <= 1.00:
                CURRENT_MULTIPLIER = 1.00
                await self.broadcast_game_state()
            else:
                while CURRENT_MULTIPLIER < crash_point:
                    await asyncio.sleep(0.1)
                    CURRENT_MULTIPLIER += 0.01 + (CURRENT_MULTIPLIER * 0.005)
                    if CURRENT_MULTIPLIER > crash_point: CURRENT_MULTIPLIER = crash_point
                    
                    await self.check_bot_cashouts()
                    await self.broadcast_game_state()

            # 4. CRASHED
            GAME_STATUS = "CRASHED"
            await self.broadcast_game_state()

            # --- CALCULATE AND SAVE PROFIT ---
            await self.save_round_stats(crash_point, ACTIVE_BETS)

            await asyncio.sleep(3)

    # --- PROFIT TRACKING LOGIC (NEW FEATURE) ---
    @database_sync_to_async
    def save_round_stats(self, crash_point, bets):
        total_bets = 0.0
        total_payouts = 0.0
        
        for bet in bets:
            # Only count REAL players (exclude bots)
            if not bet.get("is_bot"):
                amount = float(bet["amount"])
                total_bets += amount
                
                if bet["cashedOut"]:
                    # Payout = Bet Amount + Profit
                    profit = float(bet.get("profit", 0))
                    total_payouts += (amount + profit)

        house_profit = total_bets - total_payouts
        
        # Save to DB if there was any real activity
        if total_bets > 0:
            GameRound.objects.create(
                crash_point=crash_point,
                total_bets=total_bets,
                total_payouts=total_payouts,
                house_profit=house_profit
            )
            print(f"Stats Saved: Bets={total_bets}, Payouts={total_payouts}, Profit={house_profit}")

    # --- BOT LOGIC ---
    async def simulate_bot_bets(self):
        global ACTIVE_BETS
        await asyncio.sleep(0.5)
        
        if GAME_STATUS != "WAITING": return

        num_bots = random.randint(12, 20)
        selected_bots = random.sample(BOT_NAMES, num_bots)

        for name in selected_bots:
            if GAME_STATUS != "WAITING": break
            await asyncio.sleep(random.uniform(0.1, 0.4))
            
            amount = random.choice([10, 20, 50, 100, 200, 500, 1000])
            
            # Win Strategy
            rand_val = random.random()
            if rand_val < 0.70: target = random.uniform(1.10, 1.50)
            elif rand_val < 0.90: target = random.uniform(1.50, 3.00)
            else: target = random.uniform(3.00, 10.00)

            bot_bet = {
                "username": name,
                "amount": amount,
                "cashedOut": False,
                "is_bot": True,
                "target_multiplier": target
            }
            ACTIVE_BETS.append(bot_bet)
            
            public_data = {k: v for k, v in bot_bet.items() if k != "target_multiplier"}
            
            await self.channel_layer.group_send("game_room", {
                "type": "player_update",
                "action": "new_bet",
                "bet": public_data 
            })

    async def check_bot_cashouts(self):
        global ACTIVE_BETS
        for bet in ACTIVE_BETS:
            if bet.get("is_bot") and not bet["cashedOut"]:
                if CURRENT_MULTIPLIER >= bet["target_multiplier"]:
                    bet["cashedOut"] = True
                    bet["cashOutAt"] = CURRENT_MULTIPLIER
                    profit = bet["amount"] * CURRENT_MULTIPLIER - bet["amount"]
                    bet["profit"] = profit
                    
                    await self.channel_layer.group_send("game_room", {
                        "type": "player_update",
                        "action": "player_cashed_out",
                        "username": bet["username"],
                        "multiplier": round(CURRENT_MULTIPLIER, 2),
                        "profit": round(profit, 2)
                    })

    # --- ADMIN/RANDOM LOGIC ---
    @database_sync_to_async
    def get_next_crash_point(self):
        settings_obj = GameSettings.objects.first()
        if not settings_obj:
            settings_obj = GameSettings.objects.create(house_edge=10.0, force_crash_point=0.0)

        if settings_obj.force_crash_point > 1.0:
            forced = settings_obj.force_crash_point
            settings_obj.force_crash_point = 0.0
            settings_obj.save()
            # Admin forced max 30.00
            return min(forced, 30.00)

        return self.calculate_random_crash(settings_obj.house_edge, settings_obj.server_seed)

    def calculate_random_crash(self, house_edge, seed):
        round_unique = str(time.time())
        hash_obj = hmac.new(seed.encode(), round_unique.encode(), hashlib.sha256)
        hex_hash = hash_obj.hexdigest()
        decimal_val = int(hex_hash[:13], 16)
        random_number = decimal_val / (2**52)
        rtp = (100 - house_edge) / 100
        if random_number == 0: multiplier = 100.00
        else: multiplier = rtp / random_number
        
        # --- 30.00x CAP LOGIC ---
        final_multiplier = round(max(1.00, multiplier), 2)
        if final_multiplier > 30.00:
            return 30.00
        return final_multiplier

    # --- HELPERS ---
    async def broadcast_game_state(self, extra=None):
        data = {"type": "send_update", "status": GAME_STATUS, "multiplier": round(CURRENT_MULTIPLIER, 2)}
        if extra: data.update(extra)
        await self.channel_layer.group_send("game_room", data)

    async def send_update(self, event): await self.send(text_data=json.dumps(event))
    async def player_update(self, event): await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return User.objects.get(id=payload['user_id'])
        except: return None

    @database_sync_to_async
    def place_bet(self, user, amount):
        profile = Profile.objects.get(user=user)
        if profile.balance >= amount and GAME_STATUS == "WAITING":
            profile.balance = float(profile.balance) - amount
            profile.save()
            Bet.objects.create(user=user, amount=amount)
            return True
        return False

    @database_sync_to_async
    def cash_out(self, user):
        if GAME_STATUS == "FLYING":
            bet = Bet.objects.filter(user=user, cashed_out_at__isnull=True).last()
            if bet:
                settings_obj = GameSettings.objects.first()
                max_win = settings_obj.max_win_limit if settings_obj else 5000.0
                raw_win = float(bet.amount) * CURRENT_MULTIPLIER
                final_win = min(raw_win, max_win)
                profit = final_win - float(bet.amount)
                bet.cashed_out_at = CURRENT_MULTIPLIER
                bet.profit = profit
                bet.save()
                profile = Profile.objects.get(user=user)
                profile.balance = float(profile.balance) + final_win
                profile.save()
                return {"profit": profit}
        return None