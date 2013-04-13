<?php
// Start the session since phpFlickr uses it but does not start it itself
session_start();

// Require the phpFlickr API
require_once('phpFlickr-3.1/phpFlickr.php');
$data = $_POST['base64data'];
set_time_limit(60);
if ($data) {
    $image = explode('base64,',$data);
    file_put_contents('../temp/img.png', base64_decode($image[1]));
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
$result = $flickr->sync_upload('../temp/img.png', $_POST['title'], $_POST['description'], 'playcrafts, palette, palette builder');
echo "Image uploaded!<br>";
?>
<br>
<link href="css/pb.css" rel="stylesheet" type="text/css" />
<form>
<input type="button" class="button orange" value="Close Window" onClick="window.close()">
</form>
<?php
return $result;

?>


