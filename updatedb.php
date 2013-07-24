<?php
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
	// add new color to color table
	$tableName = "color";
	$id = 256200120;
	$colorRed = 256;
	$colorGreen = 200;
	$colorBlue = 120;
	$CIEL = 83.927;
	$CIEa = 10.440;
	$CIEb = 47.155;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($id, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 156;
	$color = 256200120;
	
	$sql = "UPDATE $tableName
	SET color = $color
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "color updated<BR>";
	$con->close();
}
	
?>