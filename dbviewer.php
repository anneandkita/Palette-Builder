<?php
// Create connection
$con=mysqli_connect("fabricfinder.cwf0k1kp7jtd.us-west-2.rds.amazonaws.com", "playcrafts", "x41U5L30223Y92b", "fabrics");

// Check connection
if (mysqli_connect_errno($con))
{
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
else 
{
	echo "Connection successful!<BR>";
	// get a list of all the tables
	$result = mysqli_query($con, "show tables"); // run the query and assign the result to $result
	while($table = mysqli_fetch_array($result)) { // go through each row that was returned in $result
	    echo($table[0] . "<BR><table border=1><tr>\n");    // print the table that was returned on that row.
	    // display the fields
	    $tableData = mysqli_query($con, "SELECT * FROM " . $table[0]);
	    $finfo = mysqli_fetch_fields($tableData);
	    
	    foreach ($finfo as $val) 
	    {
	    	echo ("<td width=100>\n");
	        echo($val->name);
	    	echo ("</td>\n");
	    }
	    echo ("</tr>\n");
	    // display the content of the table
	    while ($row = mysqli_fetch_array($tableData, MYSQLI_ASSOC)) 
	    {
//	    	print_r($row);
	    	echo ("<tr>\n");
	    	foreach ($row as $data)
	    	{
	    		echo ("<td>\n");
	    		echo ($data);
	    		echo ("</td>\n");
	    	}
	    	echo ("</tr>");
	    }
	    echo ("</table><BR>");
	}
	
	$con->close();
}
	
?>