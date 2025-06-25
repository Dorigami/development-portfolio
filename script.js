const tileImages = [];
const DIM = 6;
let tileSize = 0;
let grid = [];
let tiles = [];
let imagesLoaded = 0;
let tilesHaveLoaded = 0;
let body = document.body;
let html = document.documentElement;
let loopCount = 0;
// add a table between each section

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

  // clear the Table cells (for every table)
// while (parent.firstChild) {
//   parent.removeChild(parent.firstChild);
// }
  // collapse a random number of cells prior to running algorithm
  let randInd = Math.floor(Math.random(grid.length));
  grid[randInd].collapse(0);

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

function draw(myTable, myGrid){
  const w = myTable.rows[0].cells.length;
  const h = myTable.rows.length;
  console.log("table dim = " + w + ", " + h);
  for (let i = 0; i < myGrid.length; i++) {
      var td = myTable.rows[Math.floor(i/w)].cells[i%w]; 
      let cell = myGrid[i];
      if (cell.collapsed) {
        var image = new Image();
        image.className = "wfc-img";
        let tileIndex = cell.options[0];
        image.src = tiles[tileIndex].img;
        td.appendChild(image);
      }
  }
}

function tileLoaded(){
  tilesHaveLoaded++;
  if(tilesHaveLoaded >= tileImages.length*4)
  {
    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.analyze(tiles);
    }
    for(let table of document.getElementsByClassName("wfc-grid")){
        // set initial data for each table
        startOver(table);
        // run algorithm once the grid has been setup
        grid = wfc_algorithm(grid.slice());
    }
    draw();
  }
}
function preloadTiles(){
  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ['___', '___', '___', '___']);
  tiles[1] = new Tile(tileImages[1], ['___', '___', '_B_', '___']);
  tiles[2] = new Tile(tileImages[2], ['___', '___', 'C_C', '___']);
  tiles[3] = new Tile(tileImages[3], ['___', '___', 'DDD', '___']);
  tiles[4] = new Tile(tileImages[4], ['_B_', '___', '_B_', '___']);
  tiles[5] = new Tile(tileImages[5], ['_B_', '_B_', '_B_', '_B_']);
  tiles[6] = new Tile(tileImages[6], ['___', '___', '_B_', '_B_']);
  tiles[7] = new Tile(tileImages[7], ['___', '_B_', '_B_', '_B_']);
  tiles[8] = new Tile(tileImages[8], ['C_C', '___', '_B_', '___']);
  tiles[9] = new Tile(tileImages[9], ['C_C', '___', 'C_C', '___']);
  tiles[10] = new Tile(tileImages[10], ['DDD', '___', 'C_C', '___']);
  tiles[11] = new Tile(tileImages[11], ['C_C', '___', 'C_C', 'C_C']);
  tiles[12] = new Tile(tileImages[12], ['C_C', '_B_', '___', '___']);
  tiles[13] = new Tile(tileImages[13], ['DDD', '___', 'DDD', '___']);
  tiles[14] = new Tile(tileImages[14], ['DDD', 'DDD', '___', '___']);
  tiles[15] = new Tile(tileImages[15], ['DDD', 'DDD', 'DDD', '___']);
  tiles[16] = new Tile(tileImages[16], ['DDD', 'C_C', '___', '___']);
  tiles[17] = new Tile(tileImages[17], ['C_C', '___', '___', '_B_']);
  tiles[18] = new Tile(tileImages[18], ['DDD', '___', '___', 'C_C']);
  tiles[19] = new Tile(tileImages[19], ['DDD', '___', '___', '_B_']);
  tiles[20] = new Tile(tileImages[20], ['DDD', '_B_', '___', '___']);

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
  // increment load index
  if(++imagesLoaded >= (tileImages.length)){ 
    preloadTiles();
  }
}

function preloadImages() {
  // const path = './assets/tiles/circuit-coding-train';
  const path = './assets/tiles/circuit-blank';
  for (let i = 0; i < 21; i++) {
      var _img = new Image();
      _img.onload = imageLoaded;
      _img.src = `${path}/${i}.png`;
      tileImages[i] = _img;
  }
}
preloadImages();

//////////////////

function wfc_algorithm(myGrid, candidateCells){
  if(myGrid == undefined) myGrid = grid.slice();
  // create a list to contain checked nodes and nodes yet to be checked
  if(candidateCells == undefined) 
  { // get initial candidates as the neighbors of all collapsed cells
    candidateCells = [];
    for(let i=0;i<myGrid.length;i++){
      var cell = myGrid[i];
      if(cell.collapsed){
        for(k=0;k<4;k++){
if(cell.neighbors[k] == -1 || myGrid[cell.neighbors[k]].collapsed) continue;
          let myNeighbor = myGrid[cell.neighbors[k]];
          if(!myNeighbor.collapsed && !candidateCells.includes(myNeighbor))
            { candidateCells.push(myNeighbor) }
        }
      }
    }
  }

  // remove any collapsed cells, get their neighbors while this is done
  for(let i=candidateCells.length-1;i>=0;i--){
    var cell = candidateCells[i];
    if(cell.collapsed){
    // get neighbors
    for(k=0;k<4;k++){
if(cell.neighbors[k] == -1 || myGrid[cell.neighbors[k]].collapsed) continue;
      let myNeighbor = myGrid[cell.neighbors[k]];
      if(!myNeighbor.collapsed && !candidateCells.includes(myNeighbor))
        { candidateCells.push(myNeighbor) }
    }
    // remove candidate
    candidateCells.splice(i,1);
  }
  }
  if(candidateCells.length == 0){
    console.log("wfc_algo exited, all cells collapsed");
    return myGrid;
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
  // do partial load in case of excess recursion
  if(++loopCount > 30){
    loopCount = 0;
    console.log("timeout!!!!!!!!!!!!!!");
    setTimeout(wfc_algorithm,1);
    return myGrid;
  }
  // run algorithm on the grid again with current changes
  return wfc_algorithm(myGrid, candidateCells); 
}
