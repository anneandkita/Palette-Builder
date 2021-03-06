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
	// get every Kona fabric
	// get color for each Kona
	// see if it's closest
	$CIEL = mysqli_real_escape_string($con, $_GET["CIEL"]);
	$CIEa = mysqli_real_escape_string($con, $_GET["CIEa"]);
	$CIEb = mysqli_real_escape_string($con, $_GET["CIEb"]);
	$distance = 99999999;
	$closest = null;
	$closestRGB = array();
	
	$sql = "SELECT id FROM fabric WHERE line=\"Bella Solids\"";
	
	$bellaresult = mysqli_query($con, $sql) or die (mysqli_error($con)); // run the query and assign the result to $konaresult

	// go through each Kona - id to color in fabriccolor
	while ($bella = mysqli_fetch_array($bellaresult))
	{
		$id = $bella['id'];
		
		$sql = "SELECT color FROM fabriccolor WHERE id='$id'";
		$result = mysqli_query($con, $sql) or die (msqli_error($con));
		
		// go from color to CIELab in color
		$row = mysqli_fetch_array($result);
		$color = $row['color'];
		
		$sql = "SELECT * FROM color WHERE id='$color'";
		$result = mysqli_query($con, $sql) or die (mysqli_error($con));
	
		$row = mysqli_fetch_array($result);
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
	
	// find the fabric that matches this color
	$sql = "SELECT id FROM fabriccolor WHERE color=$closest";
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
			if (strcmp($row["line"], "Bella Solids") == 0)
			{ 			
				$returns[] = $row["url"];
				$returns[] = $row["name"];
				$returns[] = $closestRGB;
			}
		}
	}
	echo json_encode($returns);
	
	$con->close();
}
	
?>