from django import template

register = template.Library()

@register.inclusion_tag('threejs_app/components/threejs_renderer.html')
def render_threejs_scene(scene_config=None, width=550, height=480, background_color='#121212'):
    """ThreeJS renderer komponens renderelése"""
    return {
        'scene': scene_config or 'default',
        'width': width,
        'height': height,
        'background_color': background_color
    }

@register.inclusion_tag('threejs_app/components/scene_controls.html')
def render_scene_controls(control_type='basic'):
    """Scene kontroll panel renderelése"""
    return {
        'control_type': control_type
    }

@register.inclusion_tag('threejs_app/components/debug_panel.html')
def render_debug_panel(show_stats=False):
    """Debug panel renderelése"""
    return {
        'show_stats': show_stats
    }