
class Tile {

    // ?terrain=[tile.terrain:count]
    // &trees=[tile.index],[...]
    // &houses=[x:y],[...]               -- max:8
    // &phouse=[x:y]                     -- max:1
    // &plaza=[x:y]                      -- max:1
    // &inclines=[x:y:orientation],[...] -- max:8
    // &bridges=[x:y:orientation],[...]  -- max:8

    _terrain = {
        // 0: null,
        0: 'water',
        1: 'sand',
        2: 'dirt',
        3: 'rock',
        4: 'rock',
    }


    _trees = {
        // 0: null,
        0: 'hardwood',
        1: 'cedar',
        2: 'apple',
        3: 'pear',
        4: 'orange',
        5: 'peach',
        6: 'coconut',
        7: 'cherry',
        8: 'money',
    }


    _layers = {
        0: 'terrain',
        1: 'infrastructure',
        2: 'trees',
    }

    index   = 0
    type    = 0
    layer   = 0
    terrain = 0
    hasStroke = true

    x = 0
    y = 0


    constructor(index, terrain) {
        this.index = index

        let [x, y] = this.indexToCoords()

        this.setTerrain(terrain)

        this.x = x
        this.y = y
    }


    setTerrain(id) {
        this.terrain = id // this._terrain[id]
    }


    draw() {

        let CENTER_OFFSET = Math.floor(TILE_SIZE / 2)

        let x = (this.x * TILE_SIZE) + viewOffsetX + CENTER_OFFSET
        let y = (this.y * TILE_SIZE) + viewOffsetY + CENTER_OFFSET

        // performance measure, only draw if visible
        if (!this.isVisible()) {
            return
        }

        if (this.hasStroke) {
            fill(TILE_COLORS[this.terrain])
            stroke(255)
            strokeWeight(1)
        }

        rectMode(CENTER)
        rect(x, y, TILE_SIZE, TILE_SIZE)



        if (__DEBUG) {
            fill(255)
            stroke(0)
            textSize(16)
            textAlign(CENTER, CENTER)
            text(this.index, x, y)
        }
    }


    getIndex() {
        return this.index
    }


    indexToCoords(index = -1) {
        index = index > 0 ? index : this.index
        let x = index % ISLAND_WIDTH
        let y = Math.floor(index / ISLAND_WIDTH)

        return [x, y]
    }


    coordsToIndex(x = null, y = null) {
        x = x !== null ? x : this.x
        y = y !== null ? y : this.y
        let index = x + (y * ISLAND_WIDTH)
        return index
    }


    isVisible() {

        let x1 = 0
        let x2 = 0
        let y1 = 0
        let y2 = 0

        let buffer = TILE_SIZE * 2

        if (buffer > 0) {

        }

        return true

    }


    draw() {

        this._terrain.forEach((tile, index) => {
            tile.draw()
        })

    }


    recalculateTilesize() {
        // recalculate tilesizes
        this.TILE_SIZE       = this.BASE_TILESIZE * zoomLevel // * (windowWidth / 1500)

        console.debug('TILE_SIZE', this.TILE_SIZE)

        this.islandWidth     = this.ISLAND_WIDTH  * this.TILE_SIZE
        this.islandHeight    = this.ISLAND_HEIGHT * this.TILE_SIZE

    }

}