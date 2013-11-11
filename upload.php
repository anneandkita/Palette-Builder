<?php
// Start the session since phpFlickr uses it but does not start it itself
session_start();

// Require the phpFlickr API
require_once('phpFlickr-3.1/phpFlickr.php');
if( isset($_POST['base64data']) )
	$data = $_POST['base64data'];
if( isset($_POST['description']) )
	$description = $_POST['description'];
if( isset($_POST['title']) )
	$title = $_POST['title'];
set_time_limit(60);

if (isset($data)) {
	// omg why is there a +5 here??!? I have no clue. :(
	$ourtime = time() + 5;
	$image = explode('base64,',$data);
    file_put_contents('temp/img' . $ourtime . '.png', base64_decode($image[1]));
    chmod('temp/img' . $ourtime . '.png', 0644);
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
echo "<div id='pblogo'><img src='http://www.play-crafts.com/blog/wp-includes/images/palettebuilderlogosm.png'></div><BR>";
echo "<p>Connecting to flickr...</p>";

if (!isset($title))
	$title = $_COOKIE['title'];
if (!isset($description))
	$description = $_COOKIE['description'];
if (!isset($ourtime))
	$ourtime = $_COOKIE['ourtime'];

if (file_exists('temp/img'.$ourtime.'.png')) 
{
	$result = $flickr->sync_upload('temp/img' . $ourtime .'.png', $title, $description, 'playcrafts, palette, palette builder');
	echo "<p>Image uploaded!<br></P>";
	unlink('temp/img' . $ourtime . '.png');
}
else {
	echo "<p>There was an error sharing your photo with Flickr. Please try again.</p>";
}
?>
<br>
<link href="http://www.play-crafts.com/blog/wp-includes/css/pb.css" rel="stylesheet" type="text/css" />
<form>
<input type="button" class="button orange" value="Close Window" onClick="window.close()">
</form>


