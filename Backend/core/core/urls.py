from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/Users/', include('Users.urls')),
    path('api/', include('Products.urls')),
    path('api/Carts/', include('Carts.urls')),
    path('api/Orders/', include('Orders.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)