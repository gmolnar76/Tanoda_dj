# blockly/templatetags/blockly_tags.py
from django import template

register = template.Library()

@register.inclusion_tag('components/blockly_editor.html')
def render_blockly_editor(toolbox_config=None, initial_blocks=None, theme=None):
    """Blockly szerkesztő komponens renderelése egyéni konfigurációval"""
    return {
        'toolbox_config': toolbox_config or 'default',
        'initial_blocks': initial_blocks or [],
        'theme': theme or 'default'
    }

@register.inclusion_tag('components/threejs_renderer.html')
def render_threejs(scene_config=None, width=550, height=480):
    """ThreeJS renderer komponens renderelése egyéni konfigurációval"""
    return {
        'scene_config': scene_config or 'default',
        'width': width,
        'height': height
    }