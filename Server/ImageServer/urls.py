from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
  path('authenticate', views.Authenticate.as_view()),
  path('logout', views.Logout.as_view()),
  path('verify', views.VerifyAuthentication.as_view()),

  path('listDirectories', views.ListDirectories.as_view()),
  path('listModels', views.ListModels.as_view()),
  path('getModel', views.GetModels.as_view()),

  path('uploadFiles', views.UploadModels.as_view()),
  path('deleteFile', views.DeleteModel.as_view()),
  path('deleteDirectory', views.DeleteDirectory.as_view()),

  path('configurations', views.SyncConfigurations.as_view()),
]