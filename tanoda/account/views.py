from django.shortcuts import render, redirect
# Import authenticate and login
from django.contrib.auth import login, authenticate, logout
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
# Correct the import statement here
from .forms import CustomUserCreationForm
from django.contrib import messages
# from django.contrib.auth import logout # Already imported above
from django.contrib.auth.decorators import login_required

# Using Class-Based View for simplicity
class RegisterView(CreateView):
    form_class = CustomUserCreationForm # Ensure this uses the correct form name
    success_url = reverse_lazy('account:login') # Corrected success_url with namespace
    template_name = 'register.html'

    def form_valid(self, form):
        # Save the user
        user = form.save()
        # Optional: Log the user in directly after registration
        # login(self.request, user)
        # return redirect('home') # Or wherever you want to redirect logged-in users
        return super().form_valid(form)

# If you prefer function-based views:
# def register_view(request):
#     if request.method == 'POST':
#         form = CustomUserCreationForm(request.POST) # Ensure this uses the correct form name
#         if form.is_valid(): # Corrected 'is_valid()' call
#             user = form.save()
#             # login(request, user) # Optional login
#             return redirect('account:login') # Corrected redirect with namespace
#     else:
#         form = CustomUserCreationForm() # Ensure this uses the correct form name
#     return render(request, 'register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        # Use 'email' if that's your username field in the model and form
        email = request.POST.get('email') # Assuming email is used for login
        password = request.POST.get('password')
        if not email or not password:
             messages.error(request, "Email és jelszó megadása kötelező.")
             return render(request, 'login.html', {'form': CustomUserCreationForm()}) # Pass an empty form back

        # Authenticate using email and password
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f"Üdvözöljük, {user.get_full_name() or user.email}!")
            # Redirect to a specific page after login, e.g., 'home' or 'statisztika:felhasznalo_statisztika'
            # Check if 'next' parameter exists for redirecting back after login
            next_url = request.POST.get('next') or request.GET.get('next')
            if next_url:
                return redirect(next_url)
            else:
                return redirect('home') # Default redirect if 'next' is not present
        else:
            messages.error(request, "Hibás email cím vagy jelszó.")
            # Pass the form back to the template to show errors and retain data (optional)
            # form = AuthenticationForm(request, data=request.POST) # Or your custom login form
            return render(request, 'login.html') # Render login page again with error
    else:
        # For GET request, just render the login page
        # Pass an empty form instance if your template expects it
        # from django.contrib.auth.forms import AuthenticationForm
        # form = AuthenticationForm()
        return render(request, 'login.html') # Pass form=form if needed


@login_required
def user_logout(request):
    logout(request)
    messages.info(request, "Sikeresen kijelentkezett.") # Optional message
    # Redirect to login page after logout
    return redirect('account:login')