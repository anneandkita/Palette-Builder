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
	// remove pomegranite
	/*$tableName = "fabric";
	$cid = 247;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql) or die ("couldn't delete fabric");
	echo "fabric deleted<br>";
	
	$tableName = "fabriccolor";
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql) or die ("couldn't delete fabriccolor");
	echo "fabriccolor deleted<br>"; */
	
	// remove old colors and insert new ones
	
	// remove colors
/*
	// papaya
	$tableName = "color";
	$cid = 25616040;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";

	// mango
	$cid = 24014496;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//flame
	$cid = 2487248;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//carrot
	$cid = 2569648;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//kumquat
	$cid = 25612040;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	// corn yellow
	$cid = 24819224;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//lipstick
	$cid = 1924840;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//orange
	$cid = 24811224;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//tangerine
	$cid = 2488032;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//amber
	$cid = 24014432;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//school bus
	$cid = 24813616;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	// salmon
	$cid = 248160128;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//curry
	$cid = 23218464;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	
	//ochre
	$cid = 24818488;
	
	$sql = "DELETE FROM $tableName
	WHERE id = $cid";
	mysqli_query($con, $sql);
	echo "color deleted";
	*/
	
	
	// add new color to color table
	//pond
	$tableName = "color";
	$cid = 156215193;
	$colorRed = 156;
	$colorGreen = 215;
	$colorBlue = 193;
	$CIEL = 81.576;
	$CIEa = -23.422;
	$CIEb = 4.787;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 188;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "pond updated<BR>";
/*
	// add new color to color table
	//mango
	$tableName = "color";
	$cid = 23814093;
	$colorRed = 238;
	$colorGreen = 140;
	$colorBlue = 93;
	$CIEL = 67.816;
	$CIEa = 33.024;
	$CIEb = 40.805;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 180;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "mango updated<BR>";

	// add new color to color table
	//flame
	$tableName = "color";
	$cid = 2396643;
	$colorRed = 239;
	$colorGreen = 66;
	$colorBlue = 43;
	$CIEL = 54.471;
	$CIEa = 64.524;
	$CIEb = 51.788;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 213;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "flame updated<BR>";

	// add new color to color table
	//carrot
	$tableName = "color";
	$cid = 2478842;
	$colorRed = 247;
	$colorGreen = 88;
	$colorBlue = 42;
	$CIEL = 58.901;
	$CIEa = 58.790;
	$CIEb = 56.768;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 231;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "carrot updated<BR>";
	
		// add new color to color table
		//kumquat
		$tableName = "color";
		$cid = 24411027;
		$colorRed = 244;
		$colorGreen = 110;
		$colorBlue = 27;
		$CIEL = 62.053;
		$CIEa = 47.647;
		$CIEb = 64.683;
		
		$sql = "INSERT INTO $tableName 
			VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
		mysqli_query($con, $sql);
		
		echo "color inserted<BR>";
		// change white to point to new color
		$tableName = "fabriccolor";
		$id = 237;
		
		$sql = "UPDATE $tableName
		SET color = $cid
		WHERE id = $id";
		mysqli_query($con, $sql);
	
		echo "kumquat updated<BR>";
	
	// add new color to color table
	//corn yellow
	$tableName = "color";
	$cid = 24919431;
	$colorRed = 249;
	$colorGreen = 194;
	$colorBlue = 31;
	$CIEL = 81.194;
	$CIEa = 6.632;
	$CIEb = 78.680;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 43;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "corn yellow updated<BR>";

	// add new color to color table
	//lipstick
	$tableName = "color";
	$cid = 1944541;
	$colorRed = 194;
	$colorGreen = 45;
	$colorBlue = 41;
	$CIEL = 43.516;
	$CIEa = 57.669;
	$CIEb = 39.256;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 73;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "lipstick updated<BR>";

	// add new color to color table
	//orange
	$tableName = "color";
	$cid = 25311225;
	$colorRed = 253;
	$colorGreen = 112;
	$colorBlue = 25;
	$CIEL = 63.788;
	$CIEa = 50.005;
	$CIEb = 67.154;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 96;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "orange updated<BR>";

	// add new color to color table
	//tangerine
	$tableName = "color";
	$cid = 2436419;
	$colorRed = 243;
	$colorGreen = 64;
	$colorBlue = 19;
	$CIEL = 54.833;
	$CIEa = 65.954;
	$CIEb = 61.990;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 128;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "tangerine updated<BR>";

	// add new color to color table
	//amber
	$tableName = "color";
	$cid = 24114435;
	$colorRed = 241;
	$colorGreen = 144;
	$colorBlue = 35;
	$CIEL = 68.583;
	$CIEa = 29.545;
	$CIEb = 67.191;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 154;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "amber updated<BR>";

	// add new color to color table
	//school bus
	$tableName = "color";
	$cid = 24412911;
	$colorRed = 244;
	$colorGreen = 129;
	$colorBlue = 11;
	$CIEL = 65.716;
	$CIEa = 38.106;
	$CIEb = 70.827;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 159;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "school bus updated<BR>";

	// add new color to color table
	//salmon
	$tableName = "color";
	$cid = 237140116;
	$colorRed = 237;
	$colorGreen = 140;
	$colorBlue = 116;
	$CIEL = 68.037;
	$CIEa = 34.434;
	$CIEb = 28.679;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 160;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "salmon updated<BR>";

	// add new color to color table
	//curry
	$tableName = "color";
	$cid = 23218374;
	$colorRed = 232;
	$colorGreen = 183;
	$colorBlue = 74;
	$CIEL = 76.991;
	$CIEa = 6.663;
	$CIEb = 60.084;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 176;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "curry updated<BR>";

	// add new color to color table
	//ochre
	$tableName = "color";
	$cid = 24517787;
	$colorRed = 245;
	$colorGreen = 177;
	$colorBlue = 87;
	$CIEL = 77.008;
	$CIEa = 16.009;
	$CIEb = 54.682;
	
	$sql = "INSERT INTO $tableName 
		VALUES ($cid, $colorRed, $colorGreen, $colorBlue, $CIEL, $CIEa, $CIEb)";
	mysqli_query($con, $sql);
	
	echo "color inserted<BR>";
	// change white to point to new color
	$tableName = "fabriccolor";
	$id = 174;
	
	$sql = "UPDATE $tableName
	SET color = $cid
	WHERE id = $id";
	mysqli_query($con, $sql);

	echo "ochre updated<BR>";

*/
	$con->close();
}
	
?>