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
	// TODO: This is currently assuming that only Aurifils are in the database. This will need to be modified/optimized when other threads are added
	$CIEL = mysqli_real_escape_string($con, $_GET["CIEL"]);
	$CIEa = mysqli_real_escape_string($con, $_GET["CIEa"]);
	$CIEb = mysqli_real_escape_string($con, $_GET["CIEb"]);

	$sql = "SELECT color FROM threadcolor";
	
	$result = mysqli_query($con, $sql); // run the query and assign the result to $result
	$distance = 99999999;
	$closest = null;
	$closestRGB = array();
	//print_r($result);
	//echo "<br>";
	while($row2 = mysqli_fetch_array($result)) 
	{ // go through each row that was returned in $result

		//print_r($row2);
		//echo "<br>";
		// get information for each color
		$sql = "SELECT * FROM color WHERE id=$row2[color]";
		$res = mysqli_query($con, $sql);
		
		//print_r( $res );
		while ($row = mysqli_fetch_array($res))
		{
			// calculate the distance
			$calcDistance = sqrt(pow($row["L"]-$CIEL, 2) + pow($row["a"]-$CIEa, 2) + pow($row["b"]-$CIEb, 2));
			if ($calcDistance < $distance)
			{
				$distance = $calcDistance;
				$closest = $row["id"];
				$closestRGB["red"] = $row["red"];
				if ($closestRGB["red"] == "256")
					$closestRGB["red"] = "255";
				$closestRGB["green"] = $row["green"];
				if ($closestRGB["green"] == "256")
					$closestRGB["green"] = "255";
				$closestRGB["blue"] = $row["blue"];
				if ($closestRGB["blue"] == "256")
					$closestRGB["blue"] = "255";
			}
		}
	}
	
	// find the thread that matches this color
	$sql = "SELECT * FROM threadcolor WHERE color=$closest";
	$result = mysqli_query($con, $sql) or die (mysqli_error($con));
	$threads = array();
	while ($row = mysqli_fetch_array($result)) {
		// list the threads we've found
		$threads[] = $row["id"];
	}
	
	// get information about the matching threads
	$returns = array();
	foreach ($threads as $thread)
	{
		$sql = "SELECT * FROM thread WHERE id=$thread";
		$result = mysqli_query($con, $sql) or die (mysqli_error($con));
		
		while ($row = mysqli_fetch_array($result)) {
			$returns[] = $row["sku"];
			$returns[] = $row["name"];
			$returns[] = $closestRGB;
		}
	}
	echo json_encode($returns);
	
	$con->close();
}
	
?>