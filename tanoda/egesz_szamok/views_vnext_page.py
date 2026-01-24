"""
vNext Learning Page Views
=========================

Django views for serving the vNext learning SPA.
"""

from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def learning_vnext_view(request):
    """
    Render the vNext learning page.
    The actual UI is handled by React - Django just serves the template.

    MASTER_SPEC v1.1: "A Django oldalmenü csak URL + jelzés szerepet tölt be"
    """
    context = {
        'page_title': 'Szorzás vNext',
        'active_module': 'multiplication',
    }
    return render(request, 'egesz_szamok/vnext/learning.html', context)
