// Kocka blokk definíciója
Blockly.Blocks['create_cube'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Kocka létrehozása");
      this.appendValueInput("SIZE")
          .setCheck("Number")
          .appendField("méret");
      this.appendValueInput("COLOR")
          .setCheck("Colour")
          .appendField("szín");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Létrehoz egy kockát a megadott mérettel és színnel");
      this.setHelpUrl("");
    }
  };
  
  // JavaScript generátor a kocka blokkhoz
  Blockly.JavaScript['create_cube'] = function(block) {
    var value_size = Blockly.JavaScript.valueToCode(block, 'SIZE', Blockly.JavaScript.ORDER_ATOMIC);
    var value_color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'createCube(' + value_size + ', ' + value_color + ');\n';
    return code;
  };
  
  // Three.js függvény a kocka létrehozásához
  function createCube(size, color) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({color: color});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    renderScene();
  }
  
  // Új loadCubeTask funkció
function loadCubeTask() {
  createCube(1, 0x00ff00); // Példa: 1 egység méretű zöld kocka
}
  console.log('Cube task loaded');