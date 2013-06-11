<?php
header('Access-Control-Allow-Origin: *');
// Create connection
$con=mysqli_connect("fabricfinder.cwf0k1kp7jtd.us-west-2.rds.amazonaws.com", "playcrafts", "x41U5L30223Y92b", "fabrics");

// Check connection
if (mysqli_connect_errno($con))
{
	//$return['error'] = true;
	//$return['msg'] = "Failed to connect to MySQL: " . mysqli_connect_error();
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
else 
{		
	// which table are we looking at
	$refColor = mysqli_real_escape_string($con, $_GET["refColor"]);

	$refTable = "refcolor$refColor";
	$sql = "SELECT * FROM $refTable";
	
	$result = mysqli_query($con, $sql); // run the query and assign the result to $result
	$distance = 99999999;
	$closest = null;
	while($row = mysqli_fetch_array($result)) { // go through each row that was returned in $result
		// look at all the distances, and find the smallest one
		if ($row[1] < $distance)
		{
			$distance = $row[1];
			$closest = $row[0];
		}
	}
	
	// find the fabric that matches this color
	$sql = "SELECT * FROM fabriccolor WHERE color=$closest";
	$result = mysqli_query($con, $sql) or die (mysqli_error($con));
	$fabrics = array();
	while ($row = mysqli_fetch_array($result)) {
		// list the fabrics we've found
		$fabrics[] = $row["id"];
	}
	
	// get information about the matching fabrics
	$returns = array();
	foreach ($fabrics as $fabric)
	{
		$sql = "SELECT * FROM fabric WHERE id=$fabric";
		$result = mysqli_query($con, $sql) or die (mysqli_error($con));
		
		while ($row = mysqli_fetch_array($result)) {
			$returns[] = $row["url"];
			$returns[] = $row["name"];
			
		}
	}
	echo json_encode($returns);
	
	$con->close();
}
	
?>