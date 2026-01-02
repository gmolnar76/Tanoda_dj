from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def blockly_view(request):
    context = {
        'aktiv_modul': 'blockly',
    }
    return render(request, 'blockly/blockly.html', context)

@login_required
def blockly_3d_view(request):
    context = {
        'aktiv_modul': '3d_blockly',
    }
    return render(request, '3d_blockly/3d_blockly.html', context)

@login_required
def blockly_three_test_view(request):
    context = {
        'aktiv_modul': 'blockly_three_teszt',
    }
    return render(request, 'blockly/blockly_three_test.html', context)

@login_required
def blockly_threejs_view(request):
    return render(request, 'blockly/blockly_threejs.html', {
        'aktiv_modul': 'blockly_threejs'
    })