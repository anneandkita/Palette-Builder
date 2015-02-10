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
	// get fabric information based on a passed in ID
	$id = mysqli_real_escape_string($con, $_GET["id"]);

	$sql = "SELECT * FROM fabric WHERE id=$id";
	
	$result = mysqli_query($con, $sql); // run the query and assign the result to $result

	while($row = mysqli_fetch_array($result)) 
	{ // go through each row that was returned in $result

		// get information about the matching fabrics
		$returns = array();
		
		$returns[] = $row["id"];
		$returns[] = $row["name"];
		$returns[] = $row["line"];
		$returns[] = $row["url"];
		
		// get RGB value
		$sql = "SELECT color FROM fabriccolor WHERE id=$id";
		$result2 = mysqli_query($con, $sql);
		
		while ($row2 = mysqli_fetch_array($result2))
		{
			$sql = "SELECT * FROM color WHERE id=$row2[color]";
			$result3 = mysqli_query($con, $sql);
			
			while ($row3 = mysqli_fetch_array($result3))
			{
				$returns[] = $row3["red"];
				$returns[] = $row3["green"];
				$returns[] = $row3["blue"];
			}
		}
	}
	echo json_encode($returns);
	
	$con->close();
}
	
?>