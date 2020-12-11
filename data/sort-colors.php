<?php

$data = file_get_contents('./colors.json');

// $data = json_decode($data);

$data = preg_replace('/^\/\/[\s\S]+?$/m', '', $data);
$data = preg_replace('/,\s+(\]|\})/m', '$1', $data);


$data = json_decode($data);



foreach ($data as $index => $color) {
    $data[$index]->id = $index;
}


usort($data, function($a, $b) {
    return $a->anchor - $b->anchor;
});

print_r($data);


$data = json_encode($data);

$data = file_put_contents('./colors-sorted.json', $data);
