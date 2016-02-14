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
    def update(self , instance , validated_data):
        instance.name = validated_data.pop('name')
        instance.productType = genericType.objects.get(pk = self.context['request'].data['productType'])
        instance.fields.clear()
        instance.save()
        for f in self.context['request'].data['fields']:
            instance.fields.add(field.objects.get(pk = f))
        instance.save()
        return instance

class addressSerializer(serializers.ModelSerializer):
    class Meta:
        model = address
        fields = ('pk' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon')

class serviceSerializer(serializers.ModelSerializer):
    # user = userSearchSerializer(many = False , read_only = True)
    address = addressSerializer(many = False, read_only = True)
    class Meta:
        model = service
        fields = ('pk' , 'created' ,'name' , 'user' , 'cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo' , 'about')

class serviceLiteSerializer(serializers.ModelSerializer):
    address = addressSerializer(many = False, read_only = True)
    class Meta:
        model = service
        fields = ('pk'  ,'name' , 'address' , 'mobile' )

class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ('pk' , 'link' , 'attachment' , 'mediaType')
    def create(self ,  validated_data):
        user =  self.context['request'].user
        m = media(**validated_data)
        m.user = user
        m.save()
        return m
class offeringLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = offering
        fields = ('pk' , 'rate' ,'service' )


class offeringSerializer(serializers.ModelSerializer):
    service = serviceLiteSerializer(read_only = True, many = False )
    class Meta:
        model = offering
        fields = ('pk' , 'created' ,'inStock', 'item' , 'service' ,'active', 'cod' , 'freeReturns' , 'replacementPeriod' , 'rate' , 'shippingOptions' , 'availability' , 'shippingFee')

class offeringAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = offering
        fields = ('pk' , 'created' ,'inStock', 'item' ,'active', 'cod' , 'freeReturns' , 'replacementPeriod' , 'rate' , 'shippingOptions' , 'availability' , 'shippingFee')
    def create(self ,  validated_data):
        o = offering(**validated_data)
        u = self.context['request'].user
        o.user = u
        o.service = service.objects.get(user = u)
        o.save()
        return o

class listingLiteSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    providerOptions = offeringLiteSerializer(many = True , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' , 'title' , 'priceModel'  , 'approved' , 'category' , 'files' , 'parentType'  , 'providerOptions')

class reviewLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = reviewLike
        fields = ('pk' , 'parent' , 'positive')
        read_only_fields = ('user',)

class reviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = review
        fields = ('pk' , 'created' , 'user'  , 'item', 'rating' , 'text' , 'verified' , 'likes' , 'heading' )
        read_only_fields = ('user' , 'verified' , 'likes' , )
    def create(self ,  validated_data):
        u = self.context['request'].user
        it = validated_data.pop('item')
        if review.objects.filter(user = u , item = it ).count()==0:
            print "if"
            r = review(**validated_data)
            r.item = it
            r.user = u
        else:
            print "else"
            r = review.objects.get(user = u , item = it )
            if 'text' in self.context['request'].data:
                r.text = validated_data.pop('text')
                r.heading = validated_data.pop('heading');
            if 'rating' in self.context['request'].data:
                r.rating = validated_data.pop('rating')
        r.save()
        return r

class listingSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    providerOptions = offeringSerializer(many = True , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'title' , 'description' , 'priceModel'  , 'approved' , 'category' , 'specifications' , 'files' , 'parentType' , 'providerOptions' , 'source' )
        read_only_fields = ('user',)
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
    def update(self , instance , validated_data):
        for key in ['title' , 'description' , 'priceModel' , 'category' , 'specifications' , 'source' ]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.files.clear()
        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                instance.files.add(media.objects.get(pk = m))
        instance.save()
        return instance

class orderSerializer(serializers.ModelSerializer):
    address = addressSerializer(many = False , read_only = True)
    class Meta:
        model = order
        fields = ('id' , 'user' , 'created' , 'offer' , 'rate', 'status', 'paymentType' , 'paid' , 'address' , 'mobile' , 'coupon' , 'quantity' , 'shipping' , 'start' , 'end')
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
        fields = ('id' , 'user' , 'created' , 'item' , 'category' , 'start' , 'end' , 'quantity' )
    def create(self ,  validated_data):
        s , new = saved.objects.get_or_create(user = self.context['request'].user , item = validated_data.pop('item') , category = validated_data.pop('category'))
        try:
            s.start = validated_data.pop('start')
            s.end = validated_data.pop('end')
            s.quantity = validated_data.pop('quantity')
        except:
            pass
        s.save()
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

        try:
            a = cp.address
        except:
            a = address()
        a.street = street
        a.city = city
        a.pincode = pincode
        a.state = state
        a.save()

        cp.address = a
        cp.sendUpdates = su
        cp.mobile = m
        cp.save()
        return cp

class feedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = feedback
        fields = ('pk' , 'email' , 'mobile'  , 'message')

class offerBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = offerBanner
        fields = ('pk' , 'user' , 'created'  , 'level' , 'image' , 'title' , 'subtitle' , 'state' , 'params' , 'active')
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        b = offerBanner(**validated_data)
        b.user = u
        b.save()
        return b
    def update (self, instance, validated_data):
        instance.title = validated_data.pop('title')
        instance.subtitle = validated_data.pop('subtitle')
        instance.level = validated_data.pop('level')
        instance.state = validated_data.pop('state')
        instance.params = validated_data.pop('params')
        try:
            instance.image = validated_data.pop('image')
        except:
            pass
        if offerBanner.objects.filter(active = True).count() >= 5 and not instance.active:
            content = {'details' : 'At any time only 5 offers can be active , please deactive an active one'};
            raise NotAcceptable(detail=content)
        else:
            instance.active = validated_data.pop('active')
            instance.save()

        return instance
