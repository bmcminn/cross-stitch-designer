'use strict';



var app = new Vue({
    el: '#app',
    data() {
        return {

            app: {
                name: 'Cross Stitch Designer',
                version: '0.14 Alpha',
                author: {
                    name: 'bmcminn',
                    link: 'https://github.com/bmcminn',
                },
                links: [
                    {
                        title: 'Github',
                        link: 'https://github.com/bmcminn/cross-stitch-designer',
                    },
                    {
                        title: 'Github',
                        link: 'https://github.com/bmcminn/cross-stitch-designer#instructions',
                    },
                    {
                        title: 'Issues',
                        link: 'https://github.com/bmcminn/cross-stitch-designer/issues',
                    },
                ]
            },

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

            tiles: {},

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
                aidaCountMin: 7,
                aidaCountMax: 28,
                columns: 15,
                rows: 15,
                gridSizeMin: 10,
                gridSizeMax: 100,
                gridTextColor: '#000000',
                tilesize: 16,
                tilesizeMin: 8,
                tilesizeMax: 20,
                selectedLayer: 0,
                showCursorMarkers: true,
                showGridNumbers: true,
                showCenterCross: true,
            },

            layers: [
                {
                    title: 'green',
                    color: '#5fd12e',
                    // threadCount: 2,
                    // stitchType: 1,
                    editingtitle: false,
                    // tiles: [],
                },
                {
                    title: 'puple',
                    color: '#8080ff',
                    // threadCount: 2,
                    // stitchType: 1,
                    editingtitle: false,
                    // tiles: [],
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
            sk.frameRate(this.framerate)

            sk.canvas.style.borderColor = this.settings.gridLineColor

            this.adjustGrid(sk)

            // document.addEventListener('contextmenu', event => {
            //     if (event.target.classList.contains('p5Canvas')) {
            //         event.preventDefault()
            //         event.stopPropagation()
            //     }
            // });

            // setupEventBindings(this)
        },


        draw(sk) {
            sk.clear()
            sk.background(this.settings.gridBackgroundColor)

            this.drawTiles(sk)

            this.drawGrid(sk)
            this.drawDebug(sk)

            this.drawCursor(sk)

            this.drawCenterMarker(sk)
        },


        windowresized(sk) {
            // sk = sk ? sk : this.sketch
            // sk?.resizeCanvas(this.settings.columns * this.settings.tilesize, this.settings.rows * this.settings.tilesize)

            // sk.resizeCanvas(window.innerWidth - this.margin, window.innerHeight - this.margin)
            // this.recalculateTilesize()
        },


        keypressed(sk) {

            console.debug('keypressed', sk.key)

            switch(sk.key) {
                case 'F3':          this.DEBUG_MODE = !this.DEBUG_MODE; break
                case ']':           this.nextLayer(1); break
                case '[':           this.nextLayer(-1); break
                case '+':           this.zoomGrid(1); break
                case '-':           this.zoomGrid(-1); break
                case 'ArrowLeft':   this.nudgeDesign(-1, 0); break
                case 'ArrowUp':     this.nudgeDesign(0, -1); break
                case 'ArrowRight':  this.nudgeDesign(1, 0); break
                case 'ArrowDown':   this.nudgeDesign(0, 1); break
            }
        },


        mousepressed(sk) {

            let x = Math.floor(sk.mouseX / this.settings.tilesize)
            let y = Math.floor(sk.mouseY / this.settings.tilesize)

            let coord = `${x},${y}`


            if (sk.mouseButton === 'left') {
                this.tiles[coord] = [x, y, this.settings.selectedLayer]
                // this.tiles[coord] = {
                //     x,
                //     y,
                //     color: this.settings.selectedLayer,
                // }
            }


            if (sk.key === 'Shift' && sk.mouseButton === 'left') {
                if (this.tiles[coord]) {
                    delete this.tiles[coord]
                }
            }

            this.save()
        },


        mousemoved(sk) {
        },


        drawTiles(sk) {

            if (!this.tiles) { return }

            let tilesize = this.settings.tilesize

            Object.keys(this.tiles).forEach((key, el) => {

                if (!this.tiles.hasOwnProperty(key)) { return }

                let [x, y, colorIndex] = this.tiles[key]

                if (x < 0 || y < 0) { return }

                sk.strokeWeight(0)

                sk.fill(this.layers[colorIndex].color)
                sk.square(Number(x) * tilesize, Number(y) * tilesize, tilesize)

            }, this)


            // keys.foreach
            // this.tiles.forEach((tile, index) => {
            //     tile = tile[1]

            //     sk.strokeWeight(0)
            //     sk.fill(this.layers[tile.color].color)

            //     sk.square(tile.x * this.settings.tilesize, tile.y * this.settings.tilesize, this.settings.tilesize)
            // })

        },



        drawGrid(sk) {


            let xmax = this.settings.columns * this.settings.tilesize
            let ymax = this.settings.rows * this.settings.tilesize

            let tilecenter = Math.floor(this.settings.tilesize / 2)

            // sk.fill(this.settings.gridBackgroundColor)
            // sk.noStroke()
            // sk.rect(0, 0, xmax, ymax)


            // setup text settings
            sk.fill(0,0,0,0)
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
                        sk.fill(this.settings.gridTextColor)
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
                        sk.fill(this.settings.gridTextColor)
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
            sk.stroke(this.layers[this.settings.selectedLayer].color)
            sk.square(x, y, this.settings.tilesize)
        },


        drawCenterMarker(sk) {
            if (!this.settings.showCenterCross) { return }

            sk.stroke(this.settings.gridTextColor)
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
                // threadCount:  2,
                // stitchType:   1,
                editingtitle: false,
                // tiles: [],
            })

            this.save()
        },


        deleteLayer(index) {
            this.layers.splice(index, 1)
            this.save()
        },


        selectLayer(index) {
            this.settings.selectedLayer = index
            this.save()
        },


        nextLayer(dir) {
            this.settings.selectedLayer += dir
            this.settings.selectedLayer = this.sketch.constrain(this.settings.selectedLayer, 0, this.layers.length -1)
        },


        zoomGrid(zoom) {
            this.settings.tilesize += zoom

            this.settings.tilesize = this.sketch.constrain(this.settings.tilesize, this.settings.tilesizeMin, this.settings.tilesizeMax)
            console.debug('zoomGrid', this.settings.tilesize)

            this.adjustGrid()
        },


        nudgeDesign(x, y) {
            console.debug('nudgeDesign', x, y)
        },


        clearDesign() {
            let ans = confirm('You are about to delete your design and start over. Do you wish to continue?')

            if (ans) {
                this.tiles = {}
            }
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

            // normalize copyright date
            let design = this.design

            design.copyright = dayjs(design.copyright).format('YYYY-MM-DD')


            // invert grid text overlay colors
            this.settings.gridTextColor = getContrastYIQ(this.settings.gridBackgroundColor)


            let data = {
                layers:     this.layers,
                settings:   this.settings,
                tiles:      this.tiles,
                design,
            }

            localStorage.setItem('designdata', JSON.stringify(data))

            // this.compressData(data)
        },


        load() {

            // let data = window.location.hash.substr(1)
            // if (data.trim().length === 0) { return }

            let data = localStorage.getItem('designdata')

            if (!data) { return }

            data = JSON.parse(data)

            this.layers     = data.layers
            this.tiles      = data.tiles
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
            datetime = datetime ? datetime : new Date()
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


/**
 * Gets the contrast yiq.
 *
 * @sauce: https://gomakethings.com/dynamically-changing-the-text-color-based-on-background-color-contrast-with-vanilla-js/
 * @param      {string}   hexcolor  The hexcolor
 * @return     {boolean}  The contrast yiq.
 */
function getContrastYIQ(hexcolor){
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
        hexcolor = hexcolor.slice(1);
    }

    // If a three-character hexcode, make six-character
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }

    // Convert to RGB value
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);

    // Get YIQ ratio
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

}
