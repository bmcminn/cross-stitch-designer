'use strict';



var app = new Vue({
    el: '#app',
    data() {
        return {
            DEBUG_MODE: false,

            // VIEW PROPS
            baseTilesize: 20,
            tilesize: 1,

            zoomAdjust: 0.5,
            zoomMin: 1,
            zoomMax: 5,
            zoomLevel: 3,

            width: window.width,
            height: window.height,

            gridWidth: 0,
            gridHeight: 0,

            columns: 30,
            rows: 30,

            offsetX: 0,
            offsetY: 0,

            prevOffsetX: 0,
            prevOffsetY: 0,

            margin: 0,
            framerate: 60,
            isScrolling: false,


            currentTool: 'linestitch',

            tools: {
                linestitch: {

                }
            },

            gridData: [
                { tile: 5 },
                { tile: 5 },
                { tile: 5 },
                { tile: 5 },
                { tile: 5 },
                { tile: 5 },
                { tile: 5 },
            ],

            layers: [
                {
                    title: 'green',
                    color: '#5fd12e',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    tiles: [

                    ],
                },
                {
                    title: 'pink',
                    color: '#ff80ff',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    tiles: [

                    ],
                },
                {
                    title: 'puple',
                    color: '#8080ff',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    tiles: [

                    ],
                },
                {
                    title: 'orange',
                    color: '#ff9900',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    tiles: [

                    ],
                },
            ],

        }
    },


    computed: {
    },


    methods: {
        setup(sketch) {
            sketch.createCanvas(10,10)

            this.windowresized(sketch)

            sketch.background(255,128,0)
            sketch.frameRate(this.framerate)

            // setupEventBindings(this)

        },


        draw(sketch) {
            this.drawGrid(sketch)
            this.drawDebug(sketch)
        },


        windowresized(sketch) {
            sketch.resizeCanvas(window.innerWidth - this.margin, window.innerHeight - this.margin)
            this.recalculateTilesize()
        },


        drawGrid(sketch) {

            this.gridData.forEach((tile, index) => {
                sketch.square(this.tilesize*++index,this.tilesize,this.tilesize)
            })

        },


        save() {
            let data = {
                layers:     this.layers,
                gridWidth:  this.gridWidth,
                gridHeight: this.gridHeight,
            }

            this.compressData(data)
        },

        load() {

            if (window.location.hash.trim().length === 0) { return }

            let data = decompress(window.location.hash.substr(1))

            console.debug('load', data)

            this.layers     = data.layers
            this.gridWidth  = data.gridWidth
            this.gridHeight = data.gridHeight
        },



        compressData(data) {

            data = compress(data)

            if (history.pushState) {
                history.pushState(null, null, `#${data}`)
            } else {
                window.location.hash = `#${data}`
            }

        },


        // decompressData() {
        //     return decompress(window.location.hash)
        // },


        recalculateTilesize() {
            // recalculate tilesizes
            this.tilesize       = this.baseTilesize * this.zoomLevel // * (this.width / 1500)

            this.gridWidth      = this.columns * this.tilesize
            this.gridHeight     = this.rows    * this.tilesize
        },


        drawDebug(sketch) {

            if (!this.DEBUG_MODE) { return }

            let messages = [
                `Framerate:           ${this.framerate}FPS`,
                `MouseX:              ${mouseX}`,
                `MouseY:              ${mouseY}`,
                `X offset:            ${this.offsetX}`,
                `Y offset:            ${this.offsetY}`,
                `ViewOffset + MouseX: ${this.offsetX + mouseX}`,
                `ViewOffset + MouseY: ${this.offsetY + mouseY}`,
                `View Width:          ${width}`,
                `View Height:         ${height}`,
                `Map width:           ${this.gridWidth}`,
                `Map height:          ${this.gridHeight}`,
                `Zoom Level:          ${this.zoomLevel}`,
            ]

            let fontSize = 12

            sketch.textFont('monospace')
            sketch.textAlign(LEFT, CENTER)
            sketch.stroke('#000')
            sketch.strokeWeight(3)
            sketch.textSize(fontSize)
            sketch.fill(255)

            messages.forEach((el, index) => {
                sketch.text(el, 10, ++index * fontSize + 10)
            })
        },


        keypressed(sketch) {

        },


        zoom(level) {

            let newZoom = this.zoomLevel + (this.zoomAdjust * level)

            let minZoom = 1
            let maxZoom = 5

            if (minZoom <= newZoom && newZoom <= maxZoom) {
                this.zoomLevel = newZoom
            }

            this.recalculateTilesize()
        },


        setTool(tool) {

            console.debug('setTool', tool)
        },


        addNewLayer() {

        },


        moveLayer(index, dir) {
            let res = this.layers[index]
            this.layers.splice(index, 1)
            this.layers.splice(index + dir, 0, res)

            this.save()
        },



    },


    created() {
        this.load()
    },
})



// let DEBUG_MODE = false

// p5.disableFriendlyErrors = true


// let $canvas

// // VIEW PROPS
// let $view = {
//     baseTilesize: 20,
//     tilesize: 20,

//     zoomAdjust: 0.5,
//     zoomMin: 1,
//     zoomMax: 5,
//     zoomLevel: 3,

//     width: window.width,
//     height: window.height,

//     gridWidth: 0,
//     gridHeight: 0,

//     columns: 30,
//     rows: 30,

//     offsetX: 0,
//     offsetY: 0,

//     prevOffsetX: 0,
//     prevOffsetY: 0,

//     margin: 1,
//     framerate: 60,
//     isScrolling: false,

// }



// const TILE_COLORS = [
//     '#7bd8c3', //  water:
//     '#3f7841', //  grass1:
//     '#3d9d3d', //  grass2:
//     '#5dc446', //  grass3:

//     '#b0a07c', //  plaza:

//     '#eae39f', //  sand:
//     '#e8dc98', //  incline:
//     '#a2895a', //  dock:
//     '#787b8a', //  rock:

//     '#fcbc13', //  house:
//     '#fe81a9', // my- house
//     '#b9ad6f', //  path:
//     '#81856b', //  bridge:
// ]



// // ==============================
// //   ACTIONS SETUP
// // ==============================

// // NOTE: actions are based on the concatenated event.keydown parameters in order ctrl+shift+alt+code
// // EXAMPLE: 'NumpadAdd' is the '+' key on the numpad, 'shift+alt+KeyF'
// const ACTIONS = {
//     // '0':             () => { setTool(0) },
//     // '1':             () => { setTool(1) },
//     // '2':             () => { setTool(2) },
//     'NumpadAdd':        () => { zoom(1) },
//     'NumpadSubtract':   () => { zoom(-1) },
//     'PageUp':           () => { zoom(1) },
//     'PageDown':         () => { zoom(-1) },
//     'F3':               () => { DEBUG_MODE = !DEBUG_MODE }
// }


// window.addEventListener('keydown', (e) => {

//     if (e.isComposing || e.keyCode === 229) {
//         return
//     }

//     let key = []

//     e.ctrlKey   ? key.push('ctrl') : null
//     e.shiftKey  ? key.push('shift') : null
//     e.altKey    ? key.push('alt') : null

//     key.push(e.code)

//     key = key.join('+')

//     console.debug('keydown event', key)

//     if (ACTIONS[key]) { ACTIONS[key]() }
// })



// // ==============================
// //   APP RUNTIME / P5 METHODS
// // ==============================

// function setup() {
//     $canvas = createCanvas(10,10)
//     $canvas.style('display', 'block')

//     windowresized()

//     background(255, 0, 200)


//     frameRate($view.framerate)

//     setupEventBindings($view)

//     console.debug('sefjakles')
// }



// /**
//  * P5 draw() runtime method
//  * @return void
//  */
// function draw() {
//     background(220)

//     square(500,50,10)

//     // TODO: setup UI control for enabling/disabled debug_MODE draw
//     drawDebug()
// }


// /**
//  * P5 windowresized() runtime method
//  * @return void
//  */
// function windowresized() {
//     resizeCanvas(window.innerWidth - $view.margin, window.innerHeight - $view.margin)
//     recalculateTilesize()
// }




// // ==============================
// //   UI METHODS
// // ==============================

// // function drawIsland() {

// //     forEach((tile, index) => {
// //         tile.draw()
// //     })

// // }





// // TODO: convert this over to native P5 mousePressed(), mouseDragged(), and mouseReleased() events



// function setupEventBindings(ctx) {

//     ctx = document.getElementById('defaultCanvas0')


//     ctx.addEventListener('contextmenu', (e) => {
//         e.preventDefault()
//     })


//     ctx.addEventListener('mousedown', (e) => {

//         let isRightClick = e.button === 2

//         if (isRightClick) {
//             $view.offsetX = $view.prevOffsetX
//             $view.offsetY = $view.prevOffsetY

//             $view.isScrolling = true
//         }

//     })


//     ctx.addEventListener('mousemove', (e) => {
//         if ($view.isScrolling) {
//             $view.prevOffsetX = 0
//             $view.prevOffsetY = 0

//             $view.offsetX += e.movementX
//             $view.offsetY += e.movementY

//             $view.offsetX = constrain($view.offsetX, 0 - $view.gridWidth + width, 0)
//             $view.offsetY = constrain($view.offsetY, 0 - $view.gridHeight + height, 0)
//         }
//     })


//     ctx.addEventListener('mouseup', (e) => {
//         let isRightClick = e.button === 2

//         if (isRightClick && $view.isScrolling) {

//             $view.prevOffsetX = $view.offsetX
//             $view.prevOffsetY = $view.offsetY

//             $view.isScrolling = false
//         }
//     })
// }




// ==============================
//   APP DATA METHODS
// ==============================

/**
 * @summary Compresses `GridData[]` into a URL #hash string for bookmarking and sharing
 * @return void
 */
function compress(data) {
    // return LZString.compress(JSON.stringify(data))
    return lzwCompress.pack(data)
}


/**
 * @summary Decompresses URL #hash and hydrates `GridData[]`
 * @return {array<Tile>} A collection of `Tile()` objects
 */
function decompress(data) {
    return lzwCompress.unpack(data.split(','))
}



function queryStringEncode(obj) {
    let queryString = []

    Object.keys(obj).forEach((el, key) => {
        if (el.toString) {
            el = el.toString()
        }

        queryString.push(`${key}=${el}`)
    })

    return '?' + queryString.join('&')
}



function debounce(func, wait, immediate) {
    var timeout
    return function() {
        var context = this, args = arguments
        var later = function() {
            timeout = null
            if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
    }
}
