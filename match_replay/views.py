import json
import logging
from pathlib import Path
from django.http import JsonResponse

# Configure logging
logger = logging.getLogger(__name__)

MATCH_FILES_PATH = Path('/root/impServer/plugins/MatchLogs/Replay')  # Make sure this path is correct

def match_movements_view(request, match_id):
    """API to return movements for a given match."""
    movements_file = MATCH_FILES_PATH / f"{match_id}_movements.json"
    logger.info(f"Looking for movements file: {movements_file}")

    try:
        with open(movements_file, 'r') as f:
            movements_data = json.load(f)
        logger.info(f"Successfully loaded movements data for match {match_id}")
        return JsonResponse(movements_data, safe=False)
    except FileNotFoundError:
        logger.error(f"Movements file not found for match {match_id}")
        return JsonResponse({'error': 'Movements data not found'}, status=404)
    except Exception as e:
        logger.error(f"Error loading movements data for match {match_id}: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

def match_data_view(request, match_id):
    """API to return match data (players, colors, impostors) for a given match."""
    match_file = MATCH_FILES_PATH / f"{match_id}_match.json"
    logger.info(f"Looking for match file: {match_file}")

    try:
        with open(match_file, 'r') as f:
            match_data = json.load(f)
        logger.info(f"Successfully loaded match data for match {match_id}")
        return JsonResponse(match_data, safe=False)
    except FileNotFoundError:
        logger.error(f"Match file not found for match {match_id}")
        return JsonResponse({'error': 'Match data not found'}, status=404)
    except Exception as e:
        logger.error(f"Error loading match data for match {match_id}: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)
