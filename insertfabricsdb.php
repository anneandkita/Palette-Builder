<?php
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
	// which table are we looking at
	$tableName = mysqli_real_escape_string($con, $_POST["tableName"]);
	
	switch ($tableName) {
		case "reftables":
			// calculate the distance to each reference value 
			$CIEL = 0;
			$CIEa = 0;
			$CIEb = 0;
			$colorID = mysqli_real_escape_string($con, $_POST["colorID"]);
			$colorL = mysqli_real_escape_string($con, $_POST["colorL"]);
			settype($colorL, "double");				
			$colora = mysqli_real_escape_string($con, $_POST["colora"]);
			settype($colora, "double");				
			$colorb = mysqli_real_escape_string($con, $_POST["colorb"]);
			settype($colorb, "double");				
			
			// get a and b from -127-127 range to 0-255 range
			$colora += 127;
			$colorb += 127;

			for ($CIEL = 0; $CIEL <= 100; $CIEL += 12)
			{
				for ($CIEa = 0; $CIEa <= 255; $CIEa += 31)
				{
					for ($CIEb = 0; $CIEb <= 255; $CIEb += 31)
					{
						$tableName = "refcolor" . $CIEL . $CIEa . $CIEb;
						$sql = "SELECT * FROM $tableName WHERE color = $colorID LIMIT 1";
						$result = mysqli_query($con, $sql);
						// calculate distance sqrt((L1-L2)^2 + (a1-a2)^2 + (b1-b2)^2)
						$distance = sqrt(pow($CIEL-$colorL, 2) + pow($CIEa-$colora, 2) + pow($CIEb-$colorb, 2));
						if($result->num_rows == 0)
						{
							$sql = "INSERT INTO $tableName (color, distance)
									VALUES ($colorID, $distance)";	
							mysqli_query($con,$sql);			
						}
						else {
							$sql = "UPDATE $tableName 
							SET distance = $distance
							WHERE color = $colorID"; 
							mysqli_query($con, $sql);
						}
					}
				}
			}
			break;
		case "fabriccolor":
			$fabricName = mysqli_real_escape_string($con, $_POST["fabricName"]);
			$fabricLine = mysqli_real_escape_string($con, $_POST["fabricLine"]);
			$colorID = mysqli_real_escape_string($con, $_POST["colorID"]);
			$colorPercentage = mysqli_real_escape_string($con, $_POST["colorPercentage"]);

			$sql = "SELECT * FROM fabric WHERE name = '$fabricName' AND line = '$fabricLine' LIMIT 1";
			$result = mysqli_query($con, $sql);
			$id = -1;

			if($result->num_rows > 0)
			{
				//update
				$row = mysqli_fetch_array($result);
				$id = $row['id'];
				settype($id, "integer");
			}
			
			$sql = "SELECT * FROM $tableName WHERE id = $id LIMIT 1";
			$result = mysqli_query($con, $sql);
			
			if($result->num_rows == 0)
			{
				$sql = "INSERT INTO $tableName (id, color, percentage)
				VALUES ($id, $colorID, $colorPercentage)";	
				mysqli_query($con,$sql);			
			}
			break;
		case "color":
			$colorID = mysqli_real_escape_string($con, $_POST["colorID"]);
			$colorRed = mysqli_real_escape_string($con, $_POST["colorRed"]);
			$colorGreen = mysqli_real_escape_string($con, $_POST["colorGreen"]);
			$colorBlue = mysqli_real_escape_string($con, $_POST["colorBlue"]);
			$colorL = mysqli_real_escape_string($con, $_POST["colorL"]);
			$colora = mysqli_real_escape_string($con, $_POST["colora"]);
			$colorb = mysqli_real_escape_string($con, $_POST["colorb"]);
			
			$sql = "SELECT * FROM $tableName WHERE id = $colorID LIMIT 1";
			$result = mysqli_query($con, $sql);
			
			if($result->num_rows == 0)
			{
				$sql = "INSERT INTO $tableName (id, red, green, blue, L, a, b)
				VALUES ($colorID, $colorRed, $colorGreen, $colorBlue, $colorL, $colora, $colorb)";	
				mysqli_query($con,$sql);			
			}
			break;
		case "fabric":
			// get variables
			$fabricName = mysqli_real_escape_string($con, $_POST["fabricName"]);
			$fabricLine = mysqli_real_escape_string($con, $_POST["fabricLine"]);
			$fabricDesigner = mysqli_real_escape_string($con, $_POST["fabricDesigner"]);
			$fabricFilename = mysqli_real_escape_string($con, $_POST["fabricFilename"]);
			$fabricManufacturer = mysqli_real_escape_string($con, $_POST["fabricManufacturer"]);
			$fabricURL = mysqli_real_escape_string($con, $_POST["fabricURL"]);
			
			// does this entry exist already
			// TODO this causes issues if the fabric names are the same
			$sql = "SELECT * FROM $tableName WHERE name = '$fabricName' AND line = '$fabricLine' LIMIT 1";
			$result = mysqli_query($con, $sql);
			
			if($result->num_rows > 0)
			{
				//update
				$row = mysqli_fetch_array($result);
				$id = $row['id'];
				settype($id, "integer");
				
				$sql = "UPDATE $tableName 
					SET name = '$fabricName',
					line = '$fabricLine', 
					designer = '$fabricDesigner', 
					manufacturer = '$fabricManufacturer',
					filename = '$fabricFilename', 
					url = '$fabricURL'
					WHERE id = $id";
				mysqli_query($con,$sql);
			}
			else {
				//insert
				$sql = "INSERT INTO $tableName (name, line, designer, manufacturer, filename, url)
				VALUES ('$fabricName', '$fabricLine', '$fabricDesigner', '$fabricManufacturer', '$fabricFilename', '$fabricURL')";	
				mysqli_query($con,$sql);
			}		
			break;
		default:
	   		$return['error'] = true;
	   		$return['msg'] = "No support for " . $tableName;
	   		
	}

	$con->close();
}
	
?>