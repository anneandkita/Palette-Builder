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
	// update name based on what's been passed in
	$fabricID = mysqli_real_escape_string($con, $_GET["id"]);
	$newName = mysqli_real_escape_string($con, $_GET["name"]);
	
	$sql = "UPDATE fabric SET name=\"$newName\" WHERE id=$fabricID";	
	print_r($sql);
	$result = mysqli_query($con, $sql);
	print_r($result);
	$con->close();
}
	
?>