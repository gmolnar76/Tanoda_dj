from django.shortcuts import render

def dashboard(request):
    return render(request, "parent/dashboard.html")

def notifications(request):
    return render(request, "parent/notifications.html", {
        "notifications_data": "{}",
        "load_user_dashboard": True,
        "load_monetization_dashboard": False,
    })
