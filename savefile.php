<?php 

header("Content-type:image/png; charset=utf-8");
header("Content-Disposition: attachment; filename=" . $_POST['filename'] . ".png");
header("Pragma: no-cache");
header("Expires: 0");
$data = $_POST['base64data'];
if ($data) {
    $image = explode('base64,',$data);
    echo (base64_decode($image[1]));
//    file_put_contents('../temp/img.png', base64_decode($image[1]));
}


 ?>