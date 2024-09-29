import csv
from pathlib import Path
from django.http import JsonResponse
import os
from django.http import FileResponse, HttpResponseNotFound
from django.conf import settings
from .utils import get_top_teammates

def extract_season_name(filename):
    return filename.replace('_leaderboard.csv', '').replace('_', ' ')

def leaderboard_view(request, season):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    if season.lower().startswith("current season"):
        for file in current_season_path.glob("*_leaderboard.csv"):
            csv_file_path = file
            break
    else:
        season_folder = old_leaderboards_base / season
        if season_folder.is_dir():
            for file in season_folder.glob("*_leaderboard.csv"):
                csv_file_path = file
                break
        else:
            return JsonResponse({'error': f'Season folder not found for {season}'}, status=404)

    if not csv_file_path.exists():
        return JsonResponse({'error': f'Leaderboard data not found for {season}'}, status=404)

    leaderboard = []
    try:
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                leaderboard.append(row)
    except FileNotFoundError:
        return JsonResponse({'error': f'Leaderboard file not found for {season}'}, status=404)

    return JsonResponse(leaderboard, safe=False)

def available_seasons_view(request):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    available_seasons = []

    for file in current_season_path.glob("*_leaderboard.csv"):
        season_name = extract_season_name(file.name)
        available_seasons.append(f"Current Season - {season_name}")
        break

    for folder in old_leaderboards_base.iterdir():
        if folder.is_dir():
            available_seasons.append(folder.name)

    return JsonResponse(available_seasons, safe=False)

def player_stats_view(request, season, player_name):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    if season.lower().startswith("current season"):
        csv_file_path = next(current_season_path.glob("*_leaderboard.csv"), None)
    else:
        season_folder = old_leaderboards_base / season
        csv_file_path = next(season_folder.glob("*_leaderboard.csv"), None)

    if not csv_file_path or not csv_file_path.exists():
        return JsonResponse({'error': f'Leaderboard file not found for {season}'}, status=404)

    try:
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Player Name'] == player_name:
                    top_teammates = get_top_teammates(player_name, season)
                    player_data = {**row, 'top_teammates': top_teammates}
                    return JsonResponse(player_data)
    except FileNotFoundError:
        return JsonResponse({'error': f'Leaderboard file not found for {season}'}, status=404)

    return JsonResponse({'error': f'Player {player_name} not found in {season}'}, status=404)

def player_mmr_view(request, season, player_name):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    if season.lower().startswith("current season"):
        for file in current_season_path.glob("*_events.csv"):
            csv_file_path = file
            break
    else:
        season_folder = old_leaderboards_base / season
        if season_folder.is_dir():
            for file in season_folder.glob("*_events.csv"):
                csv_file_path = file
                break
        else:
            return JsonResponse({'error': f'Season folder not found for {season}'}, status=404)

    if not csv_file_path.exists():
        return JsonResponse({'error': f'Events data not found for {season}'}, status=404)

    mmr_data = []
    try:
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Player Name'] == player_name:
                    mmr_data.append({
                        'matchId': row['Match ID'],
                        'mmr': float(row['MMR']),
                        'impostorMmr': float(row['Impostor MMR']),
                        'crewmateMmr': float(row['Crewmate MMR']),
                        'result': row['Match Result']
                    })
    except FileNotFoundError:
        return JsonResponse({'error': f'Events file not found for {season}'}, status=404)

    return JsonResponse(mmr_data, safe=False)

def player_matches_view(request, season, player_name):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    if season.lower().startswith("current season"):
        csv_file_path = next(current_season_path.glob("*_events.csv"), None)
    else:
        season_folder = old_leaderboards_base / season
        csv_file_path = next(season_folder.glob("*_events.csv"), None)

    if not csv_file_path or not csv_file_path.exists():
        return JsonResponse({'error': f'Events data not found for {season}'}, status=404)

    matches = []
    try:
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Player Name'] == player_name:
                    matches.append({
                        'matchId': row['Match ID'],
                        'mmr': float(row['MMR']),
                        'impostorMmr': float(row['Impostor MMR']),
                        'crewmateMmr': float(row['Crewmate MMR']),
                        'result': row['Match Result'],
                        'team': row['Player Team'],
                        'won': row['Won']
                    })
    except FileNotFoundError:
        return JsonResponse({'error': f'Events file not found for {season}'}, status=404)

    return JsonResponse(matches, safe=False)

def player_icon_view(request, discord_id):
    icon_path = f"/root/discordBot/player_icons/{discord_id}.png"
    if os.path.exists(icon_path):
        return FileResponse(open(icon_path, 'rb'), content_type='image/png')
    else:
        default_icon_path = os.path.join(settings.BASE_DIR, 'frontend', 'public', 'aupp.ico')
        if os.path.exists(default_icon_path):
            return FileResponse(open(default_icon_path, 'rb'), content_type='image/x-icon')
        else:
            return HttpResponseNotFound('Player icon not found')