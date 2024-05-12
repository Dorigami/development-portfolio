// vars for WFC
const tileImages = [];
const DIM = 20;
let grid = [];
let tiles = [];
let imagesLoaded = 0;
// create the canvas
const canvas = document.getElementById('wfc_canvas'); 
const ctx = canvas.getContext("2d"); 

function preload() {
  const path = './assets/tiles/circuit-coding-train';
  for (let i = 0; i < 13; i++) {
    var _img = new Image();
    _img.onload = imageLoaded;
    _img.src = `${path}/${i}.png`;
    tileImages[i] = _img;
  }
}

// once all images are loaded, the algorithm will begin
function imageLoaded(){
  if(++imagesLoaded >= tiles.length){ 
    // create the data structures
    setup();
    // run algorithm to set tile images
    wfc_algorithm();
    // place tiles onto the canvas
    draw(); 
  }
}

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function startOver() {
  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function checkValid(arr, valid) {
  //console.log(arr, valid);
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
  // console.log(arr);
  // console.log("----------");
}

function mousePressed() {
  startOver();
  wfc_algorithm();
  draw();
}

function setup() {
  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = i;
  }
  console.log("before: " + tiles.length);
  const initialTileCount = tiles.length;
  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }
  console.log("after: " + tiles.length);

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  startOver();
}
function wfc_algorithm(){
  // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  if (gridCopy.length == 0) {
    console.log("wfc_algo exited, all cells collapsed or not existing")
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = gridCopy[Math.floor(Math.random()*gridCopy.length)];
  cell.collapsed = true;
  const pick = cell.options[Math.random(cell.options.length)];
  if (pick === undefined) {
    startOver();
    return;
  }
  cell.options = [pick];

  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        // Look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // I could immediately collapse if only one option left?
        nextGrid[index] = new Cell(options);
      }
    }
  }
  grid = nextGrid;
}

function draw(){
  const w = tileImages[0].width / DIM;
  const h = tileImages[0].height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      console.log("["+i+", "+j+"] = " + cell.options)
      if (cell.collapsed) {
        let index = cell.options[0];
        ctx.drawImage(tiles[index].img, i*w + i, j*h + j, w, h);
      } else {
        ctx.fillStyle = `rgb(
          ${Math.floor(255 - 10 * i)}
          ${Math.floor(255 - 10 * j)}
          0)`;
        ctx.fillRect(i*w + i, j*h + j, w, h);
      }
    }
  }

  /*
  // show the source tile images
  for(let i=0;i<tileImages.length;i++){
    ctx.drawImage(tileImages[i],0,i*DIM+i,DIM,DIM)
  }
  */
  // show the images assigned to tiles
  for(let i=0;i<tiles.length;i++){
    ctx.drawImage(tiles[i].img,0,i*DIM+i,DIM,DIM)
  }
}

// START THE WFC ALGORITHM
preload();

/*
let tiles = [];
const tileImages = [];

let grid = [];

const DIM = 25;



function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function setup() {
  createCanvas(400, 400);

  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  for (let i = 0; i < 12; i++) {
    tiles[i].index = i;
  }

  const initialTileCount = tiles.length;
  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }
  console.log(tiles.length);

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  startOver();
}

function startOver() {
  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function checkValid(arr, valid) {
  //console.log(arr, valid);
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
  // console.log(arr);
  // console.log("----------");
}

function mousePressed() {
  redraw();
}

function draw() {
  background(0);

  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        noFill();
        stroke(51);
        rect(i * w, j * h, w, h);
      }
    }
  }

  // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  if (gridCopy.length == 0) {
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  if (pick === undefined) {
    startOver();
    return;
  }
  cell.options = [pick];

  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        // Look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // I could immediately collapse if only one option left?
        nextGrid[index] = new Cell(options);
      }
    }
  }

  grid = nextGrid;
}
*/
