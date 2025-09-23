from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Event, EventImage
from .serializers import EventSerializer, EventImageSerializer

# Create your views here.
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by("-created_at")
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(posted_by = self.request.user)
        
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_update(self, serializer):
        event = self.get_object()
        if self.request.user != event.posted_by :
            raise PermissionDenied( "You cannot update this event.")
        serializer.save()
        
    def perform_destroy(self, instance):
        if self.request.user != instance.posted_by:
            raise PermissionDenied("You cannot delete this event.")
        instance.delete()
        
        
class EventImageDeleteView(generics.DestroyAPIView):
    queryset = EventImage.objects.all()
    serializer_class = EventImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if self.request.user != instance.event.posted_by:
            raise PermissionDenied("You cannot delete this image.")
        instance.delete()
        
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "Image deleted successfully."})
        
