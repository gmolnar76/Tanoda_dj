// Blokk definíció hozzáadása
Blockly.Blocks['load_3d_task'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Betöltés:")
        .appendField(new Blockly.FieldDropdown([
          ["Kocka", "CUBE"],
          ["Gömb", "SPHERE"],
          ["Szív", "HEART"]
        ]), "TASK");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Válassz egy 3D taskot a betöltéshez");
    this.setHelpUrl("");
  }
};

// JavaScript generátor hozzáadása
Blockly.JavaScript['load_3d_task'] = function(block) {
  var dropdown_task = block.getFieldValue('TASK');
  var code = '';
  switch(dropdown_task) {
    case 'CUBE':
      code = 'loadCubeTask();\n';
      break;
    case 'SPHERE':
      code = 'loadSphereTask();\n';
      break;
    case 'HEART':
      code = 'loadHeartTask();\n';
      break;
  }
  return code;
};

// Task betöltő függvények
function loadCubeTask() {
  createCube(1, 0x00ff00); // 1 egység méretű zöld kocka
}

function loadSphereTask() {
  createSphere(0.5, 0xff0000); // 0.5 egység sugarú piros gömb
}

function loadHeartTask() {
  createHeart();
}

// Inicializáló függvény (ezt hívjuk meg a 3d_blockly.html-ben)
function initTasks() {
  console.log('3D tasks initialized');
}