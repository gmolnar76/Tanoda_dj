let workspace;

function initBlockly() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolboxDefinition,
        scrollbars: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
    });
    console.log('Blockly initialized');
}