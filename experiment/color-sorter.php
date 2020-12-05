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
            --swatch-size: 40px;
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
    </style>

</head>
<body class="no-js">

<main id="app">

</main>

<script type="text/javascript">
<?php

$filepath = '../data/colors-hex.json';

$jsondata = file_get_contents($filepath);

// $data = json_decode($jsondata);


echo 'const COLORS = ' . $jsondata;
?>
</script>

<script type="text/javascript" src="https://raw.githubusercontent.com/SortableJS/Vue.Draggable/master/dist/vuedraggable.umd.min.js"></script>
<!-- <script src="https://unpkg.com/vue@2.6.12/dist/vue.min.js"></script> -->
<script src="/assets/vue.min.js"></script>


<script type="text/javascript">

</script>
</body>
</html>



<?php


    // usort($data, function($a, $b) {
    //     $ac = hexdec($a->color);
    //     $bc = hexdec($b->color);

    //     $ac = $a->anchor;
    //     $bc = $b->anchor;

    //     if ($ac == $bc) {
    //         return 0;
    //     }

    //     return ($ac < $bc) ? -1 : 1;
    // });

    // foreach ($data as $color) {
    //     if ($color->color) {
    //         echo "<div class=\"swatch\" style=\"background-color: {$color->color}; color:  {$color->color}\">{$color->color}</div>";
    //     }
    // }



    // $filepath = './data/colors-hex.json';

    // $filedata = file_get_contents($filepath);

    // $data = json_decode($filedata);


    // // usort($data, function($a, $b) {
    // //     $a = hexdec(substr($a,1,2));
    // //     $b = hexdec(substr($b,1,2));
    // //     if ($a == $b) { return 0; }
    // //     return ($a < $b) ? -1 : 1;
    // // });


    // foreach ($data as $color) {
    //     echo "<div class=\"swatch\" style=\"background-color: {$color}; color: {$color}\">{$color}</div>";
    // }
?>
