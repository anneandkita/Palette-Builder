<?php
// Create connection
$con=mysqli_connect("localhost", "root", "x41U5L30223Y92b", "fabricdb");

function create_tables($con)
{
	// fabric table: id, fabric name, line, designer, manufacturer, image filename, url
	$sql="CREATE TABLE IF NOT EXISTS fabric
		(
			id INT NOT NULL AUTO_INCREMENT,
			name VARCHAR(100) NOT NULL,
			line VARCHAR(100),
			designer VARCHAR(100),
			manufacturer VARCHAR(100),
			filename VARCHAR(100) NOT NULL,
			url VARCHAR(100) NOT NULL,
			PRIMARY KEY(id)
		)";
	$result = mysqli_query($con, $sql);
	if ($result) {
		echo "Fabric table was created if needed.<br>";
	}
	else {
	        echo "Fabric table error!! " . mysqli_error();  
	}
	// color table: id (rgb), r, g, b, L, a, b
	$sql="CREATE TABLE IF NOT EXISTS color
		(
			id INT NOT NULL,
			red INT NOT NULL,
			green INT NOT NULL,
			blue INT NOT NULL,
			L DOUBLE NOT NULL,
			a DOUBLE NOT NULL,
			b DOUBLE NOT NULL,
			PRIMARY KEY(id)
		)";
	$result = mysqli_query($con, $sql);
	if ($result) {
		echo "Color table was created if needed.<br>";
	}
	else {
	        echo "color table error!! " . mysqli_error();  
	}
	// fabriccolor table: fabric id, color id, percentage (0-1)
	$sql="CREATE TABLE IF NOT EXISTS fabriccolor
		(
			id INT NOT NULL,
			color INT NOT NULL,
			percentage DOUBLE NOT NULL,
			PRIMARY KEY(id)
		)";
	$result = mysqli_query($con, $sql);
	if ($result) {
		echo "Fabric-color table was created if needed.<br>";
	}
	else {
	        echo "fabric-color table error!! " . mysqli_error();  
	}
	// one table for each reference color: table for each reference color: color id, distance to
	// reference color
	$CIEL = 0;
	$CIEa = 0;
	$CIEb = 0;
	
	for ($CIEL = 0; $CIEL <= 100; $CIEL += 12)
	{
		for ($CIEa = 0; $CIEa <= 255; $CIEa += 31)
		{
			for ($CIEb = 0; $CIEb <= 255; $CIEb += 31)
			{
				$tableName = "refcolor" . $CIEL . $CIEa . $CIEb;
				$sql="CREATE TABLE IF NOT EXISTS " . $tableName . "
					(
						color INT NOT NULL,
						distance DOUBLE NOT NULL,
						PRIMARY KEY(color)
					)"; 
				$result = mysqli_query($con, $sql);
				if ($result) {
					echo "$tableName table was created if needed.<br>";
				}
				else {
				        echo "$tableName table error!! " . mysqli_error();  
				}
			
			}
		}
	}
}

// Check connection
if (mysqli_connect_errno($con))
{
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
else 
{
	echo "Connection successful!\n";
	// go through kona fabric directory, and load fabrics into the database
	create_tables($con);
	
	$con->close();
}
	
?>