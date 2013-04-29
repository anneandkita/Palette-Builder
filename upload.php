<?php
// Start the session since phpFlickr uses it but does not start it itself
session_start();

// Require the phpFlickr API
require_once('phpFlickr-3.1/phpFlickr.php');
$data = $_POST['base64data'];
$description = $_POST['description'];
$title = $_POST['title'];
set_time_limit(60);

if ($data) {
	$ourtime = time() + 5;
	$image = explode('base64,',$data);
    file_put_contents('../temp/img' . $ourtime . '.png', base64_decode($image[1]));
    setcookie("title", $title, time()+360000);
    setcookie("description", $description, time()+360000);
    setcookie("ourtime", $ourtime, time()+360000);
}

// Create new phpFlickr object: new phpFlickr('[API Key]','[API Secret]')
$flickr = new phpFlickr('449a47b49fd5569d38e6fc1f631e73bb','d68705c030f308ad', true);


// Authenticate;  need the "IF" statement or an infinite redirect will occur
if(empty($_GET['frob'])) {
	//echo "Authenticating.<br>";
    $flickr->auth('write'); // redirects if none; write access to upload a photo
}
else {
    // Get the FROB token, refresh the page;  without a refresh, there will be "Invalid FROB" error
    $flickr->auth_getToken($_GET['frob']);
    header('Location: upload.php');
    exit();
}

// Send an image sync_upload(photo, title, desc, tags)
// The returned value is an ID which represents the photo
echo "Uploading image... (this may take a few moments.)<br>";
if ($title === NULL)
	$title = $_COOKIE['title'];
if ($description === NULL)
	$description = $_COOKIE['description'];
if ($ourtime === NULL)
	$ourtime = $_COOKIE['ourtime'];
	
$result = $flickr->sync_upload('../temp/img' . $ourtime .'.png', $title, $description, 'playcrafts, palette, palette builder');
echo "Image uploaded!<br>";
unlink('../temp/img' . $ourtime . '.png');
?>
<br>
<link href="css/pb.css" rel="stylesheet" type="text/css" />
<form>
<input type="button" class="button orange" value="Close Window" onClick="window.close()">
</form>
<?php
return $result;

?>


