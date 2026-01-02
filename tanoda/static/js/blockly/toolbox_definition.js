const toolboxDefinition = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Logika",
        colour: "#5C81A6",
        contents: [
          {
            kind: "block",
            type: "controls_if"
          },
          {
            kind: "block",
            type: "logic_compare"
          }
        ]
      },
      {
        kind: "category",
        name: "Ciklusok",
        colour: "#5CA65C",
        contents: [
          {
            kind: "block",
            type: "controls_repeat_ext"
          }
        ]
      },
      {
        kind: "category",
        name: "Matematika",
        colour: "#5C68A6",
        contents: [
          {
            kind: "block",
            type: "math_number"
          },
          {
            kind: "block",
            type: "math_arithmetic"
          }
        ]
      },
      
      {
        kind: "category",
        name: "3D Tasks",
        colour: "#5C81A6",
        contents: [
          {
            kind: "block",
            type: "load_3d_task"
          }
        ]
      }

    ]
  };