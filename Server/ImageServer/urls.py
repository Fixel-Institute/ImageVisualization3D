from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import apis

urlpatterns = [
  path('/listModels', apis.ListModels.as_view()),
  path('/getModel', apis.GetModels.as_view()),
  path('/getTracts', apis.GetTracts.as_view()),
  path('/configurations', apis.SyncConfigurations.as_view()),
]