<?php
// Create connection
$con=mysqli_connect("localhost", "root", "x41U5L30223Y92b", "fabricdb");

// Check connection
if (mysqli_connect_errno($con))
{
	//$return['error'] = true;
	//$return['msg'] = "Failed to connect to MySQL: " . mysqli_connect_error();
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
else 
{		
	// get current RGB value of fabriccolor at ID to store for later
	// put in new RGB value in fabriccolor
	// add line to color table if not already there
	
	// get current RGB value of fabriccolor at ID
	$fabricID = mysqli_real_escape_string($con, $_GET["id"]);
	$colorID = mysqli_real_escape_string($con, $_GET["colorID"]);
	$red = mysqli_real_escape_string($con, $_GET["red"]);
	$green = mysqli_real_escape_string($con, $_GET["green"]);
	$blue = mysqli_real_escape_string($con, $_GET["blue"]);
	$CIEL = mysqli_real_escape_string($con, $_GET["CIEL"]);
	$CIEa = mysqli_real_escape_string($con, $_GET["CIEa"]);
	$CIEb = mysqli_real_escape_string($con, $_GET["CIEb"]);
	
	$sql = "SELECT * FROM fabriccolor WHERE id=$fabricID";
	$result = mysqli_query($con, $sql);
	
	$row = mysqli_fetch_array($result);
	$oldrgb = $row['color'];

	// put in new RGB value in fabriccolor
	$sql = "UPDATE fabriccolor SET color=$colorID WHERE id=$fabricID";
	mysqli_query($con, $sql);
	
	// insert info in color table if it isn't there already
	$sql = "SELECT * FROM color WHERE id=$colorID LIMIT 1";
	$result = mysqli_query($con, $sql);
	
	// don't update if it already exists
	if($result->num_rows == 0)
	{
		$sql = "INSERT INTO color (id, red, green, blue, L, a, b)
		VALUES ($colorID, $red, $green, $blue, $CIEL, $CIEa, $CIEb)";	
		mysqli_query($con,$sql);
	}
	
	// remove old RGB in color table if no longer referenced
	$sql = "SELECT * from fabriccolor WHERE color=$oldrgb";
	$result = mysqli_query($con, $sql);
	
	if ($result->num_rows == 0)
	{
		// not referenced anymore, so should be removed
		$sql = "DELETE FROM color WHERE id=$oldrgb";
		mysqli_query($con, $sql);
	}
	
	$con->close();
}
	
?>