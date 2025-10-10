from users.models import User
from rest_framework import serializers

class UserDetailsSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'skills','image', 'image_url', 'display_name']
        extra_kwargs = {'image': {'allow_null': True, 'required': False}}
        read_only_fields = ['username']
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and obj.image.url != 'default.jpg':
            return request.build_absolute_uri(obj.image.url)
        return None