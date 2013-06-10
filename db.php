<?php
// Create connection
$con=mysqli_connect("fabricfinder.cwf0k1kp7jtd.us-west-2.rds.amazonaws.com", "playcrafts", "x41U5L30223Y92b", "fabrics");

// Check connection
if (mysqli_connect_errno($con))
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }
else {
	echo "Connection successful!";
}
?>