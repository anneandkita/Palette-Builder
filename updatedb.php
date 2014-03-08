<?php

function RGBToLab($red, $green, $blue)
{
	// convert from 0-255 to 0-1
	$var_R = ( $red / 255 );        //$red from 0 to 255
	$var_G = ( $green / 255 );        //$green from 0 to 255
	$var_B = ( $blue / 255 );        //$blue from 0 to 255
	
	// RGB to XYZ
	
	if ( $var_R > 0.04045 ) {
		$var_R = pow((($var_R + 0.055)/1.055), 2.4);
	} else {
		$var_R = $var_R / 12.92;
	}                  
	if ( $var_G > 0.04045 ) {
	 	$var_G = pow((($var_G + 0.055)/1.055), 2.4);
	} else {
		$var_G = $var_G / 12.92;
	}
	if ( $var_B > 0.04045 ) {
		$var_B = pow((($var_B + 0.055)/1.055), 2.4);
	} else {
		$var_B = $var_B / 12.92;
	}
	
	$var_R = $var_R * 100;
	$var_G = $var_G * 100;
	$var_B = $var_B * 100;
	
	//Observer. = 2°, Illuminant = D65
	$X = $var_R * 0.4124 + $var_G * 0.3576 + $var_B * 0.1805;
	$Y = $var_R * 0.2126 + $var_G * 0.7152 + $var_B * 0.0722;
	$Z = $var_R * 0.0193 + $var_G * 0.1192 + $var_B * 0.9505;
	
	// XYZ to Lab
	$var_X = $X / 95.047;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
	$var_Y = $Y / 100.0;          //ref_Y = 100.000
	$var_Z = $Z / 108.883;          //ref_Z = 108.883
	
	if ( $var_X > 0.008856 ) {
		$var_X = pow($var_X, 1.0/3.0);
	} else {
		$var_X = (7.787 * $var_X) + (16.0 / 116.0);
	}
	if ( $var_Y > 0.008856 ) {
		$var_Y = pow($var_Y,1.0/3.0);
	} else {
		$var_Y = (7.787 * $var_Y) + (16.0 / 116.0);
	}
	if ( $var_Z > 0.008856 ) {
		$var_Z = pow($var_Z, 1.0/3.0);
	} else {
		$var_Z = ( 7.787 * $var_Z ) + (16.0 / 116.0);
	}
	$CIEL = ( 116 * $var_Y ) - 16;
	$CIEa = 500 * ( $var_X - $var_Y );
	$CIEb = 200 * ( $var_Y - $var_Z );
	
	return array ($CIEL, $CIEa, $CIEb);
}

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
	
/*	// read in csv file with aurifil information
	ini_set("auto_detect_line_endings", true);
	$row = 1;
	if (($handle = fopen("aurifil.csv", "r")) !== FALSE) {
	    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
	        $num = count($data);
	        echo "<p> $num fields in line $row:</p>\n";
	        $row++;

	        for ($c=0; $c < $num; $c++) {
	            echo $data[$c] . "<br />\n";
	        }
*/
// add white and black to aurifil table
			// sku, manufacturer, name, r, g, b
			$tableName = "thread";
			$sku = 2024;
			$man = "Aurifil Cotton Mako";
			$name = "White";
			$red = 255;
			$green = 255;
			$blue = 255;
				        
			// id (auto), sku, name, manufacturer, filename, url
			$sql = "INSERT INTO $tableName (sku, name, manufacturer)
				VALUES ($sku, '$name', '$man')";
				
			$result = mysqli_query($con, $sql);
				
			if ($result) {
				echo "Thread inserted.<br>";
			}
			else {
			        echo "thread table error!! " . mysqli_error($con);  
			}
			
			$CIELab = RGBToLab($red, $green, $blue);
				
			// fill in threadcolor table
			$tableName = "threadcolor";
				
			// get id
			$sql = "SELECT * FROM thread WHERE sku=$sku";
			$threadID = -1;
			$result = mysqli_query($con, $sql) or die (mysqli_error($con));
			while ($row = mysqli_fetch_array($result)) {
				// list the fabrics we've found
				$threadID = $row["id"];
			}
				
			// threadcolor = id (fabric), color (rgbmunge)
			$color = str_pad($red, 3, '0', STR_PAD_LEFT);
			$color = $color . str_pad($green, 3, '0', STR_PAD_LEFT);
			$color = $color . str_pad($blue, 3, '0', STR_PAD_LEFT);
				
			$sql = "INSERT INTO $tableName (id, color)
						VALUES ($threadID, $color)";
						
			$result = mysqli_query($con, $sql);
				
			if ($result)
				echo "Threadcolor inserted.<br>";
			else {
				echo "threadcolor table error!! " . mysqli_error($con);
			}
				
			// fill in color table
			$tableName = "color";
				
			// id (rgbmunge), red, green, blue, L, a, b
			$sql = "INSERT IGNORE INTO $tableName 
				   VALUES ($color, $red, $green, $blue, $CIELab[0], $CIELab[1], $CIELab[2])";
				   
			$result = mysqli_query($con, $sql);
			if ($result)
				echo "color inserted.<br>";
			else {
				echo "color table error!! " . mysqli_error($con);
			}
				
			
/*			// fill in aurifil table
	        // sku, manufacturer, name, r, g, b
	        $tableName = "thread";
	        $sku = intval($data[0]);
	        $man = $data[1];
	        $name = $data[2];
	        
	        // id (auto), sku, name, manufacturer, filename, url
			$sql = "INSERT INTO $tableName (sku, name, manufacturer)
				VALUES ($sku, '$name', '$man')";
				
			$result = mysqli_query($con, $sql);
				
			if ($result) {
				echo "Thread inserted.<br>";
			}
			else {
			        echo "thread table error!! " . mysqli_error($con);  
			}
	    */
	    /*
			// calculate Lab from RGB values
			$red = intval($data[3]);
			$green = intval($data[4]);
			$blue = intval($data[5]);
			
			$CIELab = RGBToLab($red, $green, $blue);
			
			// fill in threadcolor table
			$tableName = "threadcolor";
			
			// get id
			$sql = "SELECT * FROM thread WHERE sku=$data[0]";
			$threadID = -1;
			$result = mysqli_query($con, $sql) or die (mysqli_error($con));
			while ($row = mysqli_fetch_array($result)) {
				// list the fabrics we've found
				$threadID = $row["id"];
			}
			
			// threadcolor = id (fabric), color (rgbmunge)
			$color = str_pad($red, 3, '0', STR_PAD_LEFT);
			$color = $color . str_pad($green, 3, '0', STR_PAD_LEFT);
			$color = $color . str_pad($blue, 3, '0', STR_PAD_LEFT);
			
			$sql = "INSERT INTO $tableName (id, color)
					VALUES ($threadID, $color)";
					
			$result = mysqli_query($con, $sql);
			
			if ($result)
				echo "Threadcolor inserted.<br>";
			else {
				echo "threadcolor table error!! " . mysqli_error($con);
			}
			
			// fill in color table
			$tableName = "color";
			
			// id (rgbmunge), red, green, blue, L, a, b
			$sql = "INSERT IGNORE INTO $tableName 
			   VALUES ($color, $red, $green, $blue, $CIELab[0], $CIELab[1], $CIELab[2])";
			   
			$result = mysqli_query($con, $sql);
			if ($result)
				echo "color inserted.<br>";
			else {
				echo "color table error!! " . mysqli_error($con);
			}
			
		}

	    fclose($handle);
	}	
	
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