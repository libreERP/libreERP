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
        fields = ( 'pk', 'fieldType' , 'unit' ,'name' , 'helpText' , 'default')

class choiceLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = choiceLabel
        fields = ('pk' , 'icon' , 'name')

class choiceOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = choiceOption
        fields = ('pk' , 'parent' , 'icon' , 'name')

class genericTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = genericType
        fields = ('pk' , 'name' , 'icon')

class genericProductSerializer(serializers.ModelSerializer):
    fields = fieldSerializer(many = True, read_only = True)
    productType = genericTypeSerializer(many = False , read_only = True)
    class Meta:
        model = genericProduct
        fields = ('pk' , 'fields' , 'name' , 'productType')
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
        fields = ('pk' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon')

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
    def create(self ,  validated_data):
        user =  self.context['request'].user
        m = media()
        m.user = user
        m.attachment = validated_data.pop('attachment')
        m.link =  validated_data.pop('link')
        m.save()
        return m

class offeringSerializer(serializers.ModelSerializer):
    class Meta:
        model = offering
        fields = ('pk' , 'user' , 'created' ,'inStock', 'service' , 'item' , 'cod' , 'freeReturns' , 'replacementPeriod' , 'rate' , 'shippingOptions' , 'availability' , 'shippingFee')
        read_only_fields = ('user' , 'service' )
    def create(self ,  validated_data):
        o = offering(**validated_data)
        u = self.context['request'].user
        o.user = u
        o.service = service.objects.get(user = u)
        o.save()
        return o


class listingSerializer(serializers.ModelSerializer):
    user = userSearchSerializer(many = False , read_only = True)
    parentType = genericProductSerializer(many = False , read_only = True)
    files = mediaSerializer(many = True , read_only = True)
    providerOptions = offeringSerializer(many = True , read_only = True)

    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'title' , 'description' , 'priceModel'  , 'approved' , 'category' , 'specifications' , 'files' , 'parentType' , 'providerOptions')
    def create(self ,  validated_data):
        l = listing(**validated_data)
        l.user =  self.context['request'].user
        l.save()
        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                l.files.add(media.objects.get(pk = m))
        l.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        l.save()
        return l

class orderSerializer(serializers.ModelSerializer):
    address = addressSerializer(many = False , read_only = True)
    class Meta:
        model = order
        fields = ('id' , 'user' , 'created' , 'offer' , 'paymentType' , 'paid' , 'address' , 'mobile' , 'coupon' , 'quantity' , 'shipping')
    def create(self , validated_data):
        u = self.context['request'].user
        street = self.context['request'].data['street']
        pincode = self.context['request'].data['pincode']
        state = self.context['request'].data['state']
        city = self.context['request'].data['city']
        a = address(street = street , city = city , pincode = pincode , state = state)
        a.save()
        o = order(**validated_data)
        o.user = u
        o.address = a
        o.save()
        return o

class savedSerializer(serializers.ModelSerializer):
    class Meta:
        model = saved
        fields = ('id' , 'user' , 'created' , 'item' , 'category' )
    def create(self ,  validated_data):
        s , new = saved.objects.get_or_create(user = self.context['request'].user , item = validated_data.pop('item') , category = validated_data.pop('category'))
        return s

class customerProfileSerializer(serializers.ModelSerializer):
    address = addressSerializer(read_only = True , many = False)
    class Meta:
        model = customerProfile
        fields = ('pk' , 'address' , 'sendUpdates' , 'user' , 'mobile')
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        street = self.context['request'].data['street']
        pincode = self.context['request'].data['pincode']
        state = self.context['request'].data['state']
        city = self.context['request'].data['city']
        su = self.context['request'].data['sendUpdates']
        cp , new = customerProfile.objects.get_or_create(user = user)
        if new:
            a = address(street = street , city = city , pincode = pincode , state = state)
            a.save()
            cp.address = a
            cp.save()
        return cp

    def update (self, instance, validated_data):
        u = self.context['request'].user
        print "came"
        cp = customerProfile.objects.get(user = u)
        try:
            street = self.context['request'].data['street']
            pincode = self.context['request'].data['pincode']
            state = self.context['request'].data['state']
            city = self.context['request'].data['city']
        except:
            pass
        su = self.context['request'].data['sendUpdates']
        m = self.context['request'].data['mobile']
        a = cp.address
        a.street = street
        a.city = city
        a.pincode = pincode
        a.state = state
        a.save()
        cp.sendUpdates = su
        cp.mobile = m
        cp.save()
        return cp
