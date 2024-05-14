function reverseString(s) {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

function compareEdge(a, b) {
  return a === reverseString(b);
}

class Tile {
  constructor(img, edges, i) {
    this.img = img;
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];

    if (i !== undefined) {
      this.index = i;
    } else {
      this.index = -1;
    } 
    
    
  }

  analyze(tiles) {
    // this function populates the 'up' 'right' 'down' 'left' arrays to contain all 
    // compatible tile indexes in that direction.
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // Tile 5 can't match itself
      if (tile.index == 5 && this.index == 5) continue;

      // UP
      if (compareEdge(tile.edges[2], this.edges[0])) 
        { this.up.push(i) }
      // RIGHT
      if (compareEdge(tile.edges[3], this.edges[1])) 
        { this.right.push(i) }
      // DOWN
      if (compareEdge(tile.edges[0], this.edges[2])) 
        { this.down.push(i) }
      // LEFT
      if (compareEdge(tile.edges[1], this.edges[3])) 
        { this.left.push(i) }
    }
  }

  rotate(num) {
    const w = this.img.width;
    const h = this.img.height;
    const cv = document.createElement('canvas');
    cv.id = "wfc-tile"
    cv.width  = w;
    cv.height = h;

    const ctx = cv.getContext('2d');
    ctx.translate(w/2,h/2);
    ctx.rotate(num*Math.PI/2);
    ctx.translate(-w/2,-h/2);
    ctx.drawImage(this.img,0,0);

    const newImage = new Image();
    newImage.src = cv.toDataURL();
    newImage.onload = tileLoaded;

    let newEdges = [];
    let len = this.edges.length;
    for (let i = 0; i < len; i++) {
      newEdges[i] = this.edges[(i - num + len) % len];
    }
    return new Tile(newImage, newEdges, this.index);
  }
}
