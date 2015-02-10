<?php
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
	$sql = "SELECT name FROM fabric";
	$result = mysqli_query($con, $sql) or die (mysqli_error($con)); // run the query and assign the result to $result

	$returns = array();
	while($row = mysqli_fetch_array($result)) 
	{ // go through each row that was returned in $result
		$returns[] = $row["name"];
	}
	
	echo json_encode($returns);
	
	$con->close();
}
	
?>