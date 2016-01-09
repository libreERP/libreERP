from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response


class fieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = field
        fields = ( 'pk', 'fieldType' , 'unit' ,'name' , 'created' , 'helpText' , 'default')

class genericTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = genericType
        fields = ('pk' , 'name' , 'icon')

class genericProductSerializer(serializers.ModelSerializer):
    fields = fieldSerializer(many = True, read_only = True)
    productType = genericTypeSerializer(many = False , read_only = True)
    class Meta:
        model = genericProduct
        fields = ('pk' , 'fields' , 'name' , 'created' , 'productType')
    def create(self , validated_data):
        gp = genericProduct()
        gp.productType = genericType.objects.get(pk = self.context['request'].data['productType'])
        gp.name = validated_data.pop('name')
        gp.save()
        for f in self.context['request'].data['fields']:
            gp.fields.add(field.objects.get(pk = f))
        gp.save()
        return gp

class addressSerializer(serializers.ModelSerializer):
    class Meta:
        model = address
        fields = ('pk' , 'street' , 'city' , 'state' , 'zipcode', 'lat' , 'lon')

class serviceSerializer(serializers.ModelSerializer):
    user = userSearchSerializer(many = False , read_only = True)
    address = addressSerializer(many = False, read_only = True)
    class Meta:
        model = service
        fields = ('pk' , 'created' ,'name' , 'user' , 'cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo' , 'description')

class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ('pk' , 'link' , 'attachment' , 'mediaType')

class listingSerializer(serializers.ModelSerializer):
    user = userSearchSerializer(many = False , read_only = True)
    parentType = genericProductSerializer(many = False , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'description' , 'cod' , 'availability' , 'priceModel' , 'freeReturns' , 'shippingOptions' , 'replacementPeriod' , 'approved' , 'category' , 'specifications' , 'files' , 'parentType')
