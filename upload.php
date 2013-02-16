<?php
// Start the session since phpFlickr uses it but does not start it itself
session_start();

// Require the phpFlickr API
require_once('phpFlickr-3.1/phpFlickr.php');

$data = $_REQUEST['base64data'];
$image = explode('base64,',$data);
file_put_contents('../temp/img.png', base64_decode($image[1]));


// Create new phpFlickr object: new phpFlickr('[API Key]','[API Secret]')
$flickr = new phpFlickr('449a47b49fd5569d38e6fc1f631e73bb','d68705c030f308ad', true);


// Authenticate;  need the "IF" statement or an infinite redirect will occur
if(empty($_GET['frob'])) {
  $flickr->auth('write'); // redirects if none; write access to upload a photo
}
else {
  // Get the FROB token, refresh the page;  without a refresh, there will be "Invalid FROB" error
  $flickr->auth_getToken($_GET['frob']);
  header('Location: flickr.php');
  exit();
}

// Send an image sync_upload(photo, title, desc, tags)
// The returned value is an ID which represents the photo
$result = $flickr->sync_upload('../temp/img.png', 'test', 'test', 'playcrafts, palette, palette builder');
echo $result;
?>


