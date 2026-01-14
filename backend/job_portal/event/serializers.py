from rest_framework import serializers
from .models import Event, EventImage, EventReaction, EventComment

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = [
            "id" , "image"
        ]   
        
        
class EventSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source="posted_by.name", read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child= serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=True),
        write_only=True,
        required =False
    )
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "posted_by",
            "posted_by_name",
            "created_at",
            "images",
            "likes_count",
            "dislikes_count",
            "comments_count",
            "uploaded_images",   
        ]
        
        read_only_fields = ["id", "posted_by", "posted_by_name" ,"created_at", "images"]
        
    def get_likes_count(self, obj):
        return obj.reactions.filter(like=True).count()

    def get_dislikes_count(self, obj):
        return obj.reactions.filter(like=False).count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
        
    def create(self, validated_data):
        uploaded_images= validated_data.pop("uploaded_images", [])
        event = Event.objects.create(**validated_data)
        
        for image in uploaded_images:
            EventImage.objects.create(event=event, image=image)
    
        return event

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        instance = super().update(instance, validated_data)

        for image in uploaded_images:  #add new images without removing old ones
            EventImage.objects.create(event=instance, image=image)

        return instance
    

class EventReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReaction
        fields = ["id", "event", "like", "created_at"]
        read_only_fields = ["id", "created_at"]
        
class EventReactionDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source = "user.name" , read_only = True)
    user_email = serializers.CharField(source = "user.email", read_only = True)
    
    class Meta:
        model = EventReaction
        fields = [ "id" , "user_name", "user_email", "like", "created_at"]
        
        
class EventCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source = "user.name" , read_only = True)
    class Meta:
        model = EventComment
        fields = ["id" , "event", "user_name","content", "created_at", "updated_at" ]
        read_only_fields = ["id","event" , "user_name", "created_at", "updated_at"]
    
        