// vars for WFC

const tileImages = [];
const DIM = 6;
let tileSize = 0;
let grid = [];
let tiles = [];
let imagesLoaded = 0;
let tilesHaveLoaded = 0;
let body = document.body;
let html = document.documentElement;
// create the canvas
const canvas = document.getElementById('wfc_canvas'); 
const ctx = canvas.getContext("2d"); 
ctx.globalAlpha = 0;
canvas.width = html.clientWidth;
canvas.height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

console.log("height = " + html.clientHeight +"/"+canvas.height);

// variables for tile tracking
let wfcRowCount = 0;//Math.ceil(canvas.height / canvas.width / DIM);
//let wfcRowsLoaded = 0;
//let wfcTilesInView = Math.ceil(html.clientHeight / (canvas.width/DIM));

window.addEventListener('resize', () => {
  canvas.width = html.clientWidth;
  canvas.height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  
  // check for extended row count
  let newRowCount = Math.ceil(canvas.height / canvas.width / DIM);
  if(newRowCount > wfcRowCount){
    console.log("rowcount changed from "+wfcRowCount+" to "+newRowCount);
    for(let i=wfcRowCount; i < newRowCount; i++)
    { // add row of cells
      for(let j=0; j<DIM; j++){ grid.push(new Cell(tiles.length, i+j)) }
    }
    updateOptions();
    // collapse cells for the row
    for(let i=wfcRowCount; i < newRowCount; i++) { wfc_row(i) }
    wfcRowCount = newRowCount;
  }
  draw(canvas)
})



function preloadImages() {
  const path = './assets/tiles/circuit-coding-train';
  for (let i = 0; i < 13; i++) {
      var _img = new Image();
      _img.onload = imageLoaded;
      _img.src = `${path}/${i}.png`;
      tileImages[i] = _img;
  }
}

function preloadTiles(){
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
  const initialTileCount = tiles.length;
  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }
}

// once all images are loaded, the algorithm will move to next step (generating the tiles)
function imageLoaded(){
  if(++imagesLoaded >= (tileImages.length)){ 
    preloadTiles();
  }
}
function canvasFadeIn(){
  ctx.globalAlpha *= 1.2;
  if(ctx.globalAlpha >= 1) 
  {
    ctx.globalAlpha = 1;
  } else {
    setTimeout(canvasFadeIn, 0.005);
  }
  draw();
}
function tileLoaded(){
  tilesHaveLoaded++;
  if(tilesHaveLoaded >= tileImages.length*4)
  {
    // set canvas
    canvas.width = html.clientWidth;
    canvas.height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    wfcRowCount = Math.ceil(canvas.height / (canvas.width / DIM));
    
    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.analyze(tiles);
    }

    // set initial data for the grid
    startOver();

    // run algorithm once the grid has been setup
    grid = wfc_algorithm(grid.slice());

    // draw tiles with a fade in effect
    ctx.globalAlpha = 0.0001;
    setTimeout(canvasFadeIn, 0.01);
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
  for (let i = 0; i < DIM * wfcRowCount; i++) {
    grid[i] = new Cell(tiles.length, i);
  }
  // collapse a random number of cells prior to running algorithm
  for(let i=0; i < wfcRowCount; i++){
    for(let k=0; k <= 2 + Math.floor(Math.random()*2); k++){
      let randInd = Math.floor(Math.random()*DIM);
      randInd += i*DIM;
      //console.log("random index = " + randInd + " / " + grid.length);
      grid[randInd].collapse(1);
    }
  }
  updateOptions();
}

function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
}
function updateOptions(){
  for (let i = 0; i < grid.length; i++) {
      let cell = grid[i];
      if (cell.collapsed) continue;
      // console.log("index: "+i+"["+cell.col+","+cell.row+"] neighbors: "+ cell.neighbors)
      // create an array containing all options, then remove invalid ones
      let remainingOptions = new Array(tiles.length).fill(0).map((x, i) => i);
      // Look up
      if (cell.row > 0) {
        let up = grid[cell.neighbors[0]];
        let validOptions = [];
        for (let option of up.options) {
          let valid = tiles[option].down;
          validOptions = validOptions.concat(valid);
        }
        checkValid(remainingOptions, validOptions);
      }
      // Look right
      if (cell.col < DIM - 1) {
        let right = grid[cell.neighbors[1]];
        let validOptions = [];
        for (let option of right.options) {
          let valid = tiles[option].left;
          validOptions = validOptions.concat(valid);
        }
        checkValid(remainingOptions, validOptions);
      }
      // Look down
      if (cell.row < wfcRowCount - 1) {
        let down = grid[cell.neighbors[2]];
        let validOptions = [];
        for (let option of down.options) {
          let valid = tiles[option].up;
          validOptions = validOptions.concat(valid);
        }
        checkValid(remainingOptions, validOptions);
      }
      // Look left
      if (cell.col > 0) {
        let left = grid[cell.neighbors[3]];
        let validOptions = [];
        for (let option of left.options) {
          let valid = tiles[option].right;
          validOptions = validOptions.concat(valid);
        }
        checkValid(remainingOptions, validOptions);
      }
      // give new options to the cell
      cell.options = remainingOptions;
  }
}

function wfc_algorithm(myGrid){

  // create a list to contain checked nodes and nodes yet to be checked
  collapsedCells = [];
  candidateCells = [];
  for(let i=0;i<myGrid.length;i++){
    if(myGrid[i].collapsed) collapsedCells.push(myGrid[i])
  }
  
  // exit algorithm when all cells are collapsed
  if (collapsedCells.length == DIM*wfcRowCount) {
    console.log("wfc_algo exited, all cells collapsed");
    return myGrid;
  }

  // create list to contain candidate nodes
  for(let i=0;i<collapsedCells.length;i++){
    // for each collapsed cell, add neighboring cells as candidates, as long as they are not already collapsed
    for(k=0;k<4;k++){
      if(collapsedCells[i].neighbors[k] == -1) continue;
      let myNeighbor = myGrid[collapsedCells[i].neighbors[k]];
      if(!myNeighbor.collapsed && !candidateCells.includes(myNeighbor))
        { candidateCells.push(myNeighbor) }
    }
  }
  // get candidate with the lowest entropy (cell that has the fewest options)
  candidateCells.sort((a, b) => {
    return a.options.length - b.options.length;
  });
  // given the case that lowest entropy is shared by multiple cells,
  // count how many and store it as stopIndex
  let len = candidateCells[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < candidateCells.length; i++) {
    if (candidateCells[i].options.length > len) {
      stopIndex = i-1;
      break;
    }
  }

  // pick a cell at random from lowest entropy cells, and collapse it
  let chosenCell = candidateCells[Math.floor(Math.random()*stopIndex)];
  if(chosenCell.collapse() == false){
    //restart algorithm whenever a cell fails to collapse to a valid tile
    startOver();
    myGrid = grid.slice();
  } else {
    //recalulate options for all currently, non-collapsed cells
    updateOptions();
  }
  // run algorithm on the grid again with current changes
  return wfc_algorithm(myGrid); 
}

function wfc_row(rowIndex){
  candidateCells = [];
  startIndex = rowIndex*DIM;
  for(let i=startIndex; i<startIndex+DIM; i++){
    if(!grid[i].collapsed) candidateCells.push(grid[i]);
  }
  if (candidateCells.length == 0) {
    console.log("wfc_row_algo [ "+rowIndex+" ] exited, there are no candidates");
    return;
  }

  // get candidate with the lowest entropy (cell that has the fewest options)
  candidateCells.sort((a, b) => {
    return a.options.length - b.options.length;
  });
  // given the case that lowest entropy is shared by multiple cells,
  // count how many and store it as stopIndex
  let len = candidateCells[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < candidateCells.length; i++) {
    if (candidateCells[i].options.length > len) {
      stopIndex = i-1;
      break;
    }
  }

  // pick a cell at random from lowest entropy cells, and collapse it
  let chosenCell = candidateCells[Math.floor(Math.random()*stopIndex)];
  if(chosenCell.collapse() == false){
    //restart algorithm whenever a cell fails to collapse to a valid tile
    console.log("cell collapse failed");
    return;
  } else {
    //recalulate options for all currently, non-collapsed cells
    console.log("collapse cell "+chosenCell.index);
    updateOptions();
  }
  // run algorithm on the grid again with current changes
  return wfc_row(rowIndex); 
}

function draw(){
  const w = canvas.width / DIM;
  const h = w;// canvas.height / DIM;
  for (let i = 0; i < grid.length; i++) {
      let cell = grid[i];
      let xPos = cell.col*w;//+cell.col;
      let yPos = cell.row*h;//+cell.row;
      // console.log("["+i+", "+j+"] = " + cell.options)
      if (cell.collapsed) {
        let tileIndex = cell.options[0];
        ctx.drawImage(tiles[tileIndex].img, xPos, yPos, w, h);
      } else {
        // draw gray box instead of tile
        ctx.fillStyle = 'rgb(40,40,40)';
        ctx.fillRect(xPos,yPos,w,h);
      }
  }
}
// START THE WFC ALGORITHM
preloadImages();
