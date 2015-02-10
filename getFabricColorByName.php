<?php
// Return Lab of the thread given the name chosen

header('Access-Control-Allow-Origin: *');
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
	$fabricName = mysqli_real_escape_string($con, $_GET["fabric"]);

	// get color id from thread table using the name
	// get color info from threadcolor table
	// return color info
	$sql = "SELECT * FROM fabric WHERE name='$fabricName'";
	
	$result = mysqli_query($con, $sql) or die (mysqli_error($con)); // run the query and assign the result to $result

	// go from id to color in fabriccolor
	$row = mysqli_fetch_array($result);
	$id = $row['id'];
	
	$sql = "SELECT * FROM fabriccolor WHERE id='$id'";
	$result = mysqli_query($con, $sql) or die (msqli_error($con));
	
	// go from color to CIELab in color
	$row = mysqli_fetch_array($result);
	$color = $row['color'];
	
	$sql = "SELECT * FROM color WHERE id='$color'";
	$result = mysqli_query($con, $sql) or die (mysqli_error($con));
	
	$row = mysqli_fetch_array($result);
	$returns = array();
	$returns[] = $row['L'];
	$returns[] = $row['a'];
	$returns[] = $row['b'];
	
	echo json_encode($returns);
	
	$con->close();
}
	
?>