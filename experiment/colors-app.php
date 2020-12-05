<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cross Stitch Designer</title>
    <meta name="description" content="My official cross stitch design app, made with love <3 and built with P5.js">
    <meta name="author" content="Brandtley McMinn <https://github.com/bmcminn/cross-stitch-designer>">
    <meta name="viewport" content="width=device-width">

    <style type="text/css">
        :root {
            --swatch-size: 60px;
        }
        body {
            padding: 0;
            margin: 0;
            font-family: sans-serif;
            font-size: 1em;
        }
        .swatch {
            width: var(--swatch-size);
            height: var(--swatch-size);
            display: inline-block;
        }
        .column {
            width: calc(100vw/10.3);
            display: inline-block;
            vertical-align: top;
        }
    </style>

</head>
<body class="no-js">

<main id="app">


    <h2 slot="header">COLORS</h2>
    <draggable :list="colors"
        group="colors"
        @start="drag=true"
        @end="drag=false"
        @change="save"
    >
        <div v-for="color in colors" :key="color.id"
            class="swatch"
            :style="{ 'background-color': color.color }"
        >
            {{color.color}}
        </div>
    </draggable>


    <div class="column">
        <h2 slot="header">GREENS</h2>
        <button @click="sortColors('greens')">Sort</button>
        <div>
            <draggable :list="greens"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in greens" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">BLUES</h2>
        <button @click="sortColors('blues')">Sort</button>
        <div>
            <draggable :list="blues"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in blues" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">CYANS</h2>
        <button @click="sortColors('cyans')">Sort</button>
        <div>
            <draggable :list="cyans"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in cyans" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">VIOLETS</h2>
        <button @click="sortColors('violets')">Sort</button>
        <div>
            <draggable :list="violets"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in violets" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">REDS</h2>
        <button @click="sortColors('reds')">Sort</button>
        <div>
            <draggable :list="reds"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in reds" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">PINKS</h2>
        <button @click="sortColors('pinks')">Sort</button>
        <div>
            <draggable :list="pinks"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in pinks" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">ORANGES</h2>
        <button @click="sortColors('oranges')">Sort</button>
        <div>
            <draggable :list="oranges"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in oranges" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">YELLOWS</h2>
        <button @click="sortColors('yellows')">Sort</button>
        <div>
            <draggable :list="yellows"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in yellows" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">BROWNS</h2>
        <button @click="sortColors('browns')">Sort</button>
        <div>
            <draggable :list="browns"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in browns" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>


    <div class="column">
        <h2 slot="header">GRAYS</h2>
        <button @click="sortColors('grays')">Sort</button>
        <div>
            <draggable :list="grays"
                group="colors"
                @start="drag=true"
                @end="drag=false"
                @change="save"
            >
                <div v-for="color in grays" :key="color.id"
                    class="swatch"
                    :style="{ 'background-color': color.color }"
                >
                    {{color.color}}
                </div>
            </draggable>
        </div>
    </div>
</main>



<script src="//cdnjs.cloudflare.com/ajax/libs/vue/2.5.2/vue.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/sortablejs@1.8.4/Sortable.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/Vue.Draggable/2.20.0/vuedraggable.umd.min.js"></script>
<!-- <script src="/assets/vue.min.js"></script> -->


<script type="text/javascript">

<?php

$colors = json_decode(file_get_contents('../data/colors-data.json'), true);

if (!is_array($colors[0])) {
    foreach ($colors as $index => $color) {
        $colors[$index] = [
            'color' => $color,
            'id'    => $index
        ];
    }

    file_put_contents('../data/colors-data.json', json_encode($colors));
}

echo 'const COLORS = ' . json_encode($colors);

?>

new Vue({
    el: '#app',
    data() {
        return {
            colors: COLORS,
            reds: [],
            pinks: [],
            violets: [],
            oranges: [],
            yellows: [],
            blues: [],
            cyans: [],
            greens: [],
            browns: [],
            grays: [],
        }
    },

    methods: {

        sortColors(colorName) {

            let color = this[colorName]

            sortColorsList

            this[colorName] = color
            // console.debug(color)

        },

        save() {
            let data = {
                colors:     this.colors,
                reds:       this.reds,
                pinks:      this.pinks,
                violets:    this.violets,
                oranges:    this.oranges,
                yellows:    this.yellows,
                blues:      this.blues,
                cyans:      this.cyans,
                greens:     this.greens,
                browns:     this.browns,
                grays:      this.grays,
            }

            localStorage.setItem('colors', JSON.stringify(data))
        },

    },

    created() {
        let colors = localStorage.getItem('colors')


        if (colors) {
            colors = JSON.parse(colors)
            this.colors     = colors.colors ?? []
            this.reds       = colors.reds ?? []
            this.pinks      = colors.pinks ?? []
            this.violets    = colors.violets ?? []
            this.oranges    = colors.oranges ?? []
            this.yellows    = colors.yellows ?? []
            this.blues      = colors.blues ?? []
            this.cyans      = colors.cyans ?? []
            this.greens     = colors.greens ?? []
            this.browns     = colors.browns ?? []
            this.grays      = colors.grays ?? []
        } else {
            this.colors = COLORS
        }

    }
})






var Color = function Color(hexVal) { //define a Color class for the color objects
    this.hex = hexVal;
};

constructColor = function(colorObj){
    var hex = colorObj.hex.substring(1);
    /* Get the RGB values to calculate the Hue. */
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;

    /* Getting the Max and Min values for Chroma. */
    var max = Math.max.apply(Math, [r, g, b]);
    var min = Math.min.apply(Math, [r, g, b]);


    /* Variables for HSV value of hex color. */
    var chr = max - min;
    var hue = 0;
    var val = max;
    var sat = 0;


    if (val > 0) {
        /* Calculate Saturation only if Value isn't 0. */
        sat = chr / val;
        if (sat > 0) {
            if (r == max) {
                hue = 60 * (((g - min) - (b - min)) / chr);
                if (hue < 0) {
                    hue += 360;
                }
            } else if (g == max) {
                hue = 120 + 60 * (((b - min) - (r - min)) / chr);
            } else if (b == max) {
                hue = 240 + 60 * (((r - min) - (g - min)) / chr);
            }
        }
    }
    colorObj.chroma = chr;
    colorObj.hue = hue;
    colorObj.sat = sat;
    colorObj.val = val;
    colorObj.luma = 0.3 * r + 0.59 * g + 0.11 * b;
    colorObj.red = parseInt(hex.substring(0, 2), 16);
    colorObj.green = parseInt(hex.substring(2, 4), 16);
    colorObj.blue = parseInt(hex.substring(4, 6), 16);
    return colorObj;
};

sortColorsBy = function (colors, prop) {
    return colors.sort(function (a, b) {
        return a[prop] - b[prop]
    });
};

/**
 * @sauce: https://jsfiddle.net/shanfan/ojgp5718/
 * @also: https://codepen.io/andrewicarlson/pen/jbQRWr
 *
 * @param      {<type>}  colors    The colors
 * @param      {<type>}  domClass  The dom class
 * @return     {<type>}  { description_of_the_return_value }
 */
sortColorsList = function(colors, domClass) {
    colors = colors.map((hex, index) => {
        var color = new Color(hex);
        return constructColor(color);
    });

    return sortColorsBy(colors, 'luma').map(el => el.hex)
};

</script>
</body>
</html>
