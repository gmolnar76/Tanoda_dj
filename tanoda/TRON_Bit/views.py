from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def tron_bit_view(request):
    return render(request, 'tron_bit/tron_bit.html')

@login_required
def tron_index_view(request):
    """Renders the TRON_Bit index/navigation page."""
    return render(request, 'tron_bit/tron_index.html')

@login_required
def experiment1_view(request):
    """Renders the first experimental Three.js animation page."""
    return render(request, 'tron_bit/experiment1.html')

@login_required
def experiment2_view(request):
    """Renders the second experimental Three.js animation page (forgó gömb)."""
    return render(request, 'tron_bit/experiment2.html')

@login_required
def experiment3_view(request):
    """Renders the third experimental Three.js animation page (egyszerű 3D objektumok)."""
    return render(request, 'tron_bit/experiment3.html')