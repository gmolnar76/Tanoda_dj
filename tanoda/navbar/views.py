from django.shortcuts import render


def navbar_config(request):
    # Itt kezelheted a navbar konfigurációját, ha szükséges
    context = {
        'navbar_items': [
            {'name': 'Főoldal', 'url': '/'},
            {'name': 'Évfolyamok', 'url': '/evfolyamok'},
        ]
    }
    return render(request, 'navbar/navbar.html', context)