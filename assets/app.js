'use strict';



var app = new Vue({
    el: '#app',
    data() {
        return {

            sketch: null,

            DEBUG_MODE: false,

            // VIEW PROPS
            baseTilesize: 20,

            zoomAdjust: 0.5,
            zoomMin: 1,
            zoomMax: 5,
            zoomLevel: 3,

            width: window.width,
            height: window.height,

            grid: [],

            gridCrossSize: 5,

            gridCenterX: 0,
            gridCenterY: 0,

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

            gridData: [],

            design: {
                widthInches: 0,
                heightInches: 0,
                widthMM: 0,
                heightMM: 0,
                owner: '',
                title: 'New Cross Stitch Design',
                copyright: new Date(),
            },

            settings: {
                gridBackgroundColor: '#ffffff',
                gridLineColor: '#dfdfdf',
                aidaCount: 14,
                columns: 15,
                rows: 15,
                tilesize: 16,
                showCursorMarkers: true,
                showGridNumbers: true,
                showCenterCross: true,
            },

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


            sk.canvas.style.borderColor = this.settings.gridLineColor
            console.debug('sketch', sk)

            this.adjustGrid(sk)

            sk.background(255,128,0)
            sk.frameRate(this.framerate)

            // setupEventBindings(this)
        },


        draw(sk) {
            sk.clear()
            this.drawGrid(sk)
            this.drawDebug(sk)


            this.drawCursor(sk)

            this.drawCenterMarker(sk)

        },


        windowresized(sk) {
            // sk = sk ? sk : this.sketch
            // sk?.resizeCanvas(this.settings.columns * this.settings.tilesize, this.settings.rows * this.settings.tilesize)


            // let centerX = (this.settings.columns / 2)
            // let centerY = (this.settings.rows / 2)

            // centerX = centerX % 1 === 0 ? centerX : centerX + 0.5
            // centerY = centerY % 1 === 0 ? centerY : centerY + 0.5

            // centerX *= this.settings.tilesize
            // centerY *= this.settings.tilesize

            // centerX -= Math.floor(this.settings.tilesize / 2)
            // centerY -= Math.floor(this.settings.tilesize / 2)


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


            let xmax = this.settings.columns * this.settings.tilesize
            let ymax = this.settings.rows * this.settings.tilesize

            let tilecenter = Math.floor(this.settings.tilesize / 2)

            sk.fill(this.settings.gridBackgroundColor)
            sk.noStroke()
            sk.rect(0, 0, xmax, ymax)


            // setup text settings
            sk.fill(0,0,0)
            sk.textAlign(sk.CENTER)
            sk.stroke(this.settings.gridLineColor)


            // draw vertical grid lines
            for (let x = this.settings.columns; x >= 0; x--) {

                if (x === this.settings.columns) { continue }
                if (x === 0) { continue }

                sk.strokeWeight(1)

                if (x % 5 === 0) {
                    if (this.settings.showGridNumbers) {
                        sk.strokeWeight(0)
                        sk.fill(0,0,0)
                        sk.text(x, x * this.settings.tilesize - tilecenter, tilecenter + 3)
                        sk.text(x, x * this.settings.tilesize - tilecenter, ymax - tilecenter + 3)
                    }

                    sk.strokeWeight(2)
                }

                sk.line(x * this.settings.tilesize, 0, x * this.settings.tilesize, ymax)
            }


            // draw horizontal grid lines
            for (let y = this.settings.rows; y >= 0; y--) {

                if (y === this.settings.rows) { continue }
                if (y === 0) { continue }

                sk.strokeWeight(1)
                sk.textAlign(sk.CENTER)

                if (y % 5 === 0) {

                    if (this.settings.showGridNumbers) {
                        sk.strokeWeight(0)
                        sk.fill(0,0,0)
                        sk.text(y, tilecenter, y * this.settings.tilesize - tilecenter + 5)
                        sk.text(y, xmax - tilecenter, y * this.settings.tilesize - tilecenter + 5)
                    }

                    sk.strokeWeight(2)
                }

                sk.line(0, y * this.settings.tilesize, xmax, y * this.settings.tilesize)
            }
        },


        drawCursor(sk) {
            let x = Math.floor(sk.mouseX / this.settings.tilesize) * this.settings.tilesize
            let y = Math.floor(sk.mouseY / this.settings.tilesize) * this.settings.tilesize

            if (this.settings.showCursorMarkers) {
                sk.fill('rgba(0,0,0,0.15)')
                sk.strokeWeight(2)

                sk.square(0, y, this.settings.tilesize)
                sk.square(x, 0, this.settings.tilesize)
                sk.square(x, (this.settings.rows - 1) * this.settings.tilesize, this.settings.tilesize)
                sk.square((this.settings.columns - 1) * this.settings.tilesize, y, this.settings.tilesize)
            }

            sk.fill(0,0,0,0)
            sk.stroke(this.layers[this.selectedLayer].color)
            sk.square(x, y, this.settings.tilesize)
        },


        drawCenterMarker(sk) {
            if (!this.settings.showCenterCross) { return }

            sk.stroke(0,0,0)
            sk.strokeWeight(2)

            sk.line(this.gridCenterX, this.gridCenterY - this.gridCrossSize, this.gridCenterX, this.gridCenterY + this.gridCrossSize)
            sk.line(this.gridCenterX - this.gridCrossSize, this.gridCenterY, this.gridCenterX + this.gridCrossSize, this.gridCenterY)

        },



        drawDebug(sk) {
            if (!this.DEBUG_MODE) { return }

            // sk.clear()

            let messages = [
                `Framerate:           ${sk.deltaTime}FPS`,
                `MouseX:              ${sk.mouseX}`,
                `MouseY:              ${sk.mouseY}`,
                `X offset:            ${this.offsetX}`,
                `Y offset:            ${this.offsetY}`,
                `cells:               ${this.gridData.length}`,
                // `ViewOffset + MouseX: ${this.offsetX + sk.mouseX}`,
                // `ViewOffset + MouseY: ${this.offsetY + sk.mouseY}`,
                `View Width:          ${this.width}`,
                `View Height:         ${this.height}`,
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


        adjustGrid(sk) {

            sk = sk ? sk : this.sketch

            // force rows and columns to numbers
            this.settings.rows      = Number(this.settings.rows)
            this.settings.columns   = Number(this.settings.columns)

            // resize canvas accordingly
            sk.resizeCanvas(this.settings.columns * this.settings.tilesize, this.settings.rows * this.settings.tilesize)

            // calc grid center
            this.gridCenterX = (this.settings.columns / 2) * this.settings.tilesize
            this.gridCenterY = (this.settings.rows / 2) * this.settings.tilesize

            // update canvas stats
            this.design.widthInches     = this.settings.columns / this.settings.aidaCount
            this.design.heightInches    = this.settings.rows / this.settings.aidaCount

            this.design.widthMM         = this.design.widthInches * 25.4
            this.design.heightMM        = this.design.heightInches * 25.4

            this.save()
        },


        save() {

            let design = this.design

            design.copyright = dayjs(design.copyright).format('YYYY-MM-DD')

            let data = {
                layers:     this.layers,
                settings:   this.settings,
                design,
            }

            console.debug('save', design.copyright)

            localStorage.setItem('designdata', JSON.stringify(data))

            // this.compressData(data)
        },


        load() {

            // let data = window.location.hash.substr(1)
            // if (data.trim().length === 0) { return }

            let data = localStorage.getItem('designdata')

            if (!data) { return }

            data = JSON.parse(data)

            console.debug('this.settings', data.settings)

            this.layers     = data.layers
            this.settings   = Object.assign({}, this.settings, data.settings)

            data.design.copyright = new Date(data.design.copyright)
            this.design     = data.design

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
            this.settings.tilesize       = this.baseTilesize * this.zoomLevel // * (this.width / 1500)

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
    },


    created() {

        this.load()

        document.body.classList.remove('no-js')

    },


    filters: {
        round(value, decimals=2) {
            return Number.parseFloat(value).toFixed(decimals)
        },

        datetime(datetime, format='YYYY-mm-dd') {
            return dayjs(datetime).format(format)
        }
    }
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
// //   UI METHODS
// // ==============================

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
