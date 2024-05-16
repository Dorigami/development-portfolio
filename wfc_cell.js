class Cell {
  constructor(value, ind) {
    this.collapsed = false;
    this.index = ind;
    this.row = Math.floor(ind/DIM);
    this.col = ind % DIM;
    // get index values for each neighbor
    this.neighbors = [
      ind-DIM >= 0 ? ind-DIM : -1, // up neighbor cell
      Math.floor((ind+1)/DIM) == this.row ? ind+1 : -1, // right neighbor cell
      ind+DIM < DIM*wfcRowCount ? ind+DIM : -1, // down neighbor cell
      Math.floor((ind-1)/DIM) == this.row ? ind-1 : -1, // left neighbor cell
    ];
    this.neighborObjects = [
      this.neighbors[0] == -1 ? -1 : grid[this.neighbors[0]],
      this.neighbors[1] == -1 ? -1 : grid[this.neighbors[1]],
      this.neighbors[2] == -1 ? -1 : grid[this.neighbors[2]],
      this.neighbors[3] == -1 ? -1 : grid[this.neighbors[3]]
    ];
    if (value instanceof Array) {
      this.options = value;
    } else {
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
  }
  collapse(ind) {
    // reduce options down to one
    this.collapsed = this.options.length <= 1;
    if(!this.collapsed){
      let chosenTile = ind == undefined ? Math.floor(Math.random()*this.options.length) : ind;
      this.options = [this.options[chosenTile]];
      this.collapsed = true;
    }
    // returns false when the collapse is a failure
    return this.options[0] != undefined
  }
}
