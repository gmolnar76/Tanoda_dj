Blockly.Blocks['create_sphere'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Gömb létrehozása");
    this.appendValueInput("RADIUS")
        .setCheck("Number")
        .appendField("sugár");
    this.appendValueInput("COLOR")
        .setCheck("Colour")
        .appendField("szín");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Létrehoz egy gömböt a megadott sugárral és színnel");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_sphere'] = function(block) {
  var value_radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_ATOMIC);
  var value_color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'createSphere(' + value_radius + ', ' + value_color + ');\n';
  return code;
};

function createSphere(radius, color) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({color: color});
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  renderScene();
}

function loadSphereTask() {
  createSphere(0.5, 0xff0000); // Példa: 0.5 egység sugarú piros gömb
}

console.log('Sphere task loaded');