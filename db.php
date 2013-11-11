<?php
// Create connection
$con=mysqli_connect("localhost", "root", "x41U5L30223Y92b", "fabricdb");

// Check connection
if (mysqli_connect_errno($con))
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }
else {
	echo "Connection successful!";
}
?>