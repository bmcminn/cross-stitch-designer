'use strict';



var app = new Vue({
    el: '#app',
    data() {
        return {

            sketch: null,

            DEBUG_MODE: false,

            // VIEW PROPS
            baseTilesize: 20,
            tilesize: 20,

            zoomAdjust: 0.5,
            zoomMin: 1,
            zoomMax: 5,
            zoomLevel: 3,

            width: window.width,
            height: window.height,

            grid: [],

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
            selectedLayer: 0,


            currentTool: 'linestitch',

            tools: {
                linestitch: {

                }
            },

            gridData: [
            ],

            layers: [
                {
                    title: 'green',
                    color: '#5fd12e',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    isSelected: false,
                    tiles: [

                    ],
                },
                {
                    title: 'pink',
                    color: '#ff80ff',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    isSelected: false,
                    tiles: [

                    ],
                },
                {
                    title: 'puple',
                    color: '#8080ff',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    isSelected: false,
                    tiles: [

                    ],
                },
                {
                    title: 'orange',
                    color: '#ff9900',
                    threadCount: 2,
                    stitchType: 1,
                    editingtitle: false,
                    isSelected: false,
                    tiles: [

                    ],
                },
            ],
        }
    },


    computed: {
    },


    methods: {

        // ==============================
        //  P5 METHODS
        // ==============================


        setup(sk) {

            this.sketch = sk
            sk.createCanvas(10,10)

            this.windowresized(sk)

            sk.background(255,128,0)
            sk.frameRate(this.framerate)

            // setupEventBindings(this)
        },


        draw(sk) {
            sk.clear()
            this.drawGrid(sk)
            this.drawDebug(sk)


            this.drawCursor(sk)


        },


        windowresized(sk) {

            sk = sk ? sk : this.sketch
            sk?.resizeCanvas(this.columns * this.tilesize, this.rows * this.tilesize)
            // sk.resizeCanvas(window.innerWidth - this.margin, window.innerHeight - this.margin)
            // this.recalculateTilesize()
        },


        keypressed(sk) {
            switch(sk.key) {
                case 'F3':
                    this.DEBUG_MODE = !this.DEBUG_MODE
                    break
            }
        },


        mousemoved(sk) {



        },


        drawGrid(sk) {
            // if (this.rows < 1 && this.columns < 1) { return }

            this.tilesize = 20

            for (var i = this.gridData.length - 1; i >= 0; i--) {

                let [x,y] = indexToXY(i, this.columns, this.rows)

                sk.fill(0,0,0,0)
                sk.stroke('#efefef')
                sk.strokeWeight(2)

                sk.rect(x * this.tilesize, y * this.tilesize, this.tilesize, this.tilesize)
                // console.debug(x, y)

                // draw col/row index labels

                // if (x === 0 && y === 0) {
                //     sk.text(i+1, x, y+10)
                // }

                let isFirstCell = x === 0 && y === 0
                let isXDivByFive = (x + 1) % 5 === 0
                let isYDivByFive = (y + 1) % 5 === 0

                if (isFirstCell || isXDivByFive
                &&  y === 0) {
                    sk.fill(0,0,0)
                    sk.textAlign(sk.CENTER)
                    sk.text(x+1, (x * this.tilesize) + Math.floor(this.tilesize/2), y+15)


                }

                if (isYDivByFive) {

                    let labelX = Math.floor(this.tilesize/2)

                    if (x === this.columns-1) {
                        labelX += x * this.tilesize
                    }

                    sk.fill(0,0,0)
                    sk.text(y+1, labelX, ((y + 1) * this.tilesize) - 5)
                }

                // if (x === 0
                // &&  isYDivByFive) {
                //     sk.fill(0,0,0)
                //     sk.textAlign(sk.CENTER)
                //     sk.text(y+1, 50, 50)
                // }


            }
        },


        drawCursor(sk) {
            let x = Math.floor(sk.mouseX / this.tilesize) * this.tilesize
            let y = Math.floor(sk.mouseY / this.tilesize) * this.tilesize

            sk.fill('rgba(0,0,0,0.15)')
            sk.strokeWeight(2)

            sk.square(0, y, this.tilesize)
            sk.square(x, 0, this.tilesize)
            sk.square(x, (this.rows - 1) * this.tilesize, this.tilesize)
            sk.square((this.columns - 1) * this.tilesize, y, this.tilesize)

            //
            sk.fill(0,0,0,0)
            sk.stroke(this.layers[this.selectedLayer].color)
            sk.square(x, y, this.tilesize)
        },


        drawDebug(sk) {
            if (!this.DEBUG_MODE) { return }

            // sk.clear()

            let messages = [
                `Framerate:           ${this.framerate}FPS`,
                `MouseX:              ${sk.mouseX}`,
                `MouseY:              ${sk.mouseY}`,
                `X offset:            ${this.offsetX}`,
                `Y offset:            ${this.offsetY}`,
                `cells:               ${this.gridData.length}`,
                // `ViewOffset + MouseX: ${this.offsetX + sk.mouseX}`,
                // `ViewOffset + MouseY: ${this.offsetY + sk.mouseY}`,
                `View Width:          ${this.width}`,
                `View Height:         ${this.height}`,
                `Map width:           ${this.gridWidth}`,
                `Map height:          ${this.gridHeight}`,
                // `Zoom Level:          ${this.zoomLevel}`,
            ]

            let fontSize = 14

            sk.textFont('monospace')
            sk.textAlign(sk.LEFT, sk.CENTER)
            sk.stroke('#000')
            sk.strokeWeight(3)
            sk.textSize(fontSize)
            sk.fill(255)

            messages.forEach((el, index) => {
                sk.text(el, 10, ++index * fontSize + 10)
            })
        },



        // ==============================
        //  APP UI METHODS
        // ==============================

        newLayer() {
            this.layers.unshift({
                title:        `Layer ${this.layers.length}`,
                color:        randomHex(), // '#5fd12e',
                threadCount:  2,
                stitchType:   1,
                editingtitle: false,
                tiles: [

                ],
            })

            this.save()
        },


        deleteLayer(index) {
            this.layers.splice(index, 1)
            this.save()
        },


        selectLayer(index) {
            this.selectedLayer = index
        },


        adjustGrid() {
            this.gridData = new Array(this.rows * this.columns)
            this.windowresized()
            this.save()
        },


        save() {
            let data = {
                layers:     this.layers,
                gridWidth:  this.gridWidth,
                gridHeight: this.gridHeight,
                columns:    this.columns,
                rows:       this.rows,
            }

            this.compressData(data)
        },


        load() {
            if (window.location.hash.trim().length === 0) { return }

            let data = decompress(window.location.hash.substr(1))

            this.layers     = data.layers
            this.gridWidth  = data.gridWidth
            this.gridHeight = data.gridHeight
            this.columns    = data.columns
            this.rows       = data.rows

            this.adjustGrid()
        },


        compressData(data) {
            data = compress(data)

            if (history.pushState) {
                history.pushState(null, null, `#${data}`)
            } else {
                window.location.hash = `#${data}`
            }
        },


        recalculateTilesize() {
            this.tilesize       = this.baseTilesize * this.zoomLevel // * (this.width / 1500)

            this.gridWidth      = this.columns * this.tilesize
            this.gridHeight     = this.rows    * this.tilesize
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


    mounted() {

        document.body.classList.remove('no-js')

    },


    created() {
        this.load()
    },
})



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


function indexToXY(index, width, height) {
    if (index > width * height) { return [ null, null ] }

    let x = index % width
    let y = Math.floor(index / width)

    return [x, y]
}


function xyToIndex(x, y, width, height) {
    let index = x + (y * width)
    if (index > width * height) { return null }
    return index
}


function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)]
}


/**
 * Paul Irish's random hex color code generator
 * @sauce: https://www.paulirish.com/2009/random-hex-color-code-snippets/
 * @return {string} A random hex color string
 */
function randomHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
}
