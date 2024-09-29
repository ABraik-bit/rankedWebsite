import csv
from collections import defaultdict
from pathlib import Path

def get_top_teammates(player_name, season):
    old_leaderboards_base = Path("/root/discordBot/old_leaderboards")
    current_season_path = Path("/root/discordBot")

    if season.lower().startswith("current season"):
        csv_file_path = next(current_season_path.glob("*_events.csv"), None)
    else:
        season_folder = old_leaderboards_base / season
        csv_file_path = next(season_folder.glob("*_events.csv"), None)

    if not csv_file_path or not csv_file_path.exists():
        return None

    teammates_impostor = defaultdict(int)
    teammates_crewmate = defaultdict(int)
    teammates_overall = defaultdict(int)

    with open(csv_file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        current_match = None
        match_players = set()

        for row in reader:
            if row['Player Name'] == player_name:
                if current_match != row['Match ID']:
                    current_match = row['Match ID']
                    match_players.clear()
                
                player_team = row['Player Team']

                for teammate_row in reader:
                    if teammate_row['Match ID'] != current_match:
                        break
                    
                    teammate_name = teammate_row['Player Name']
                    if teammate_name != player_name and teammate_name not in match_players:
                        match_players.add(teammate_name)
                        teammates_overall[teammate_name] += 1
                        if player_team == 'impostor':
                            teammates_impostor[teammate_name] += 1
                        elif player_team == 'crewmate':
                            teammates_crewmate[teammate_name] += 1

    top_impostor = sorted(teammates_impostor.items(), key=lambda x: x[1], reverse=True)[:10]
    top_crewmate = sorted(teammates_crewmate.items(), key=lambda x: x[1], reverse=True)[:10]
    top_overall = sorted(teammates_overall.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        'impostor': top_impostor,
        'crewmate': top_crewmate,
        'overall': top_overall
    }