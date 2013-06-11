<?php
echo sqrt(pow(72-74.58, 2) + pow(124-126, 2) + pow(124-131, 2));

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
	$sql = "UPDATE fabric
			SET name = 'Pomegranate'
			WHERE id = 108";
			
	mysqli_query($con, $sql) or die(mysqli_error($con));
	$con->close();
}

?>