from rest_framework import serializers
from .models import Event, EventImage

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
            "uploaded_images",   
        ]
        
        read_only_fields = ["id", "posted_by", "posted_by_name" ,"created_at", "images"]
        
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