from django import forms
from django.contrib.auth.models import User
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout, Field, Fieldset, MultiField,Button,HTML, Div, Hidden
from crispy_forms.bootstrap import PrependedText, PrependedAppendedText, FormActions, FieldWithButtons,TabHolder, Tab

class loginForm(forms.Form):
    username = forms.CharField(label = 'Username', required = True , widget = forms.TextInput(attrs={'placeholder':'Username'}))
    password = forms.CharField(label = 'Password', required = True , widget = forms.PasswordInput(attrs={'placeholder':'Password'}))
    helper = FormHelper()
    helper.form_method = 'POST'
    helper.form_class = 'form-horizontal'
    helper.label_class = 'col-sm-3'
    helper.field_class = 'col-sm-6'
    helper.layout = Layout(
        Fieldset('Login' ,'username' , 'password')
    )
    helper.add_input(Submit('login', 'login', css_class='btn-primary'))
