from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from .models import Event, EventImage, EventReaction, EventComment
from .serializers import EventSerializer, EventImageSerializer, EventReactionSerializer, EventReactionDetailSerializer, EventCommentSerializer

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
    
    
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Event, EventReaction

class EventReactionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        user = request.user
        reaction_type = request.data.get("reaction")  # expected: "like", "dislike", or "none"

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        reaction, created = EventReaction.objects.get_or_create(event=event, user=user)

        if reaction_type == "like":
            reaction.like = True
        elif reaction_type == "dislike":
            reaction.like = False
        elif reaction_type == "none":
            reaction.like = None
        else:
            return Response({"error": "Invalid reaction type."}, status=status.HTTP_400_BAD_REQUEST)

        reaction.save()
        return Response({"message": f"You reacted as {reaction_type}."}, status=status.HTTP_200_OK)
       
       
class EventLikeListView(generics.ListAPIView):
    serializer_class = EventReactionDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        event_id = self.kwargs["event_id"]
        return EventReaction.objects.filter(event_id = event_id, like =True)
    
class EventDislikeListView(generics.ListAPIView):
    serializer_class = EventReactionDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        event_id = self.kwargs["event_id"]
        return EventReaction.objects.filter(event_id = event_id, like =False)
    
class EventCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    
    def get_queryset(self):
        event_id = self.kwargs["event_id"]
        return EventComment.objects.filter(event_id=event_id).order_by("-created_at")
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "comment_count" : queryset.count(),
            "comments" : serializer.data 
        })
    
    def perform_create(self, serializer):
        event_id = self.kwargs["event_id"]
        event = get_object_or_404(Event, id = event_id)
        serializer.save(user= self.request.user, event=event)
        
class EventCommentUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventComment.objects.all()
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user :
            raise PermissionDenied("You can only modify your comment")
        serializer.save()
        
    def delete(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != self.request.user and comment.event.posted_by != self.request.user :
            raise PermissionDenied("You can only delete your comment")
        comment.delete()
        return Response({"message" : "comment deleted successfully...."}, status=200)