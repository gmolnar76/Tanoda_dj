from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json

@login_required
def kordinata(request):
    # 2D adatok előkészítése React számára
    data_2d = [
        {"x": 1, "y": 10},
        {"x": 2, "y": 15},
        {"x": 3, "y": 13},
        {"x": 4, "y": 17},
        {"x": 5, "y": 20}
    ]
    
    # 3D adatok előkészítése React számára
    data_3d = [
        {"x": 1, "y": 10, "z": 5},
        {"x": 2, "y": 15, "z": 2},
        {"x": 3, "y": 13, "z": 8},
        {"x": 4, "y": 17, "z": 3},
        {"x": 5, "y": 20, "z": 7}
    ]
    
    # JSON adatok előkészítése a React komponensek számára
    chart_data = {
        'data2D': data_2d,
        'data3D': data_3d
    }
    
    context = {
        'aktiv_modul': 'kordinata',
        'chart_data': json.dumps(chart_data),
    }
    
    return render(request, 'plotly/kordinata/kordinata.html', context)

@login_required
def plotly_main(request):
    # Sample data for demonstration
    data = [
        {"x": 1, "y": 5, "label": "A"},
        {"x": 2, "y": 7, "label": "B"},
        {"x": 3, "y": 3, "label": "C"},
        {"x": 4, "y": 8, "label": "D"},
        {"x": 5, "y": 6, "label": "E"}
    ]
    
    context = {
        'aktiv_modul': 'plotly_main',
        'chart_data': json.dumps(data),
    }
    
    return render(request, 'plotly/main_chart.html', context)