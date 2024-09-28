from django.urls import path
from .views import match_movements_view, match_data_view

urlpatterns = [
    path('<int:match_id>/movements/', match_movements_view, name='match_movements'),
    path('<int:match_id>/data/', match_data_view, name='match_data'),
]
