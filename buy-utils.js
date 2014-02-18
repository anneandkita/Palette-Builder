<script type="text/javascript" src="/blog/wp-includes/js/jquery-1.8.1.min.js"></script>

$(document).ready(startApp);

// parse variables of the URL and pass them to the website options
function startApp() {
	// parse variables from the URL
	var numColors = getURLValue("numColors");
	
	// create kona list
	var konaList = [];
	var itemList = "";
	
	$(".info").html("<h1>HY Kona Bundle - ");
	for (var i=0; i<numColors; i++)
	{
		konaList.push(decodeURIComponent(getURLValue("kona"+i)));
		$(".info").append(konaList[i]);
		if (i < (numColors-1))
			$(".info").append(", ");
	}
	$(".info").append("</h1>");
	
}

function getURLValue(varSearch){
    var searchString = window.location.search.substring(1);
    var varArray = searchString.split('&');
     for(var i = 0; i < varArray.length; i++){
     	var keyValuePair = varArray[i].split('=');
		if(keyValuePair[0] == varSearch){
		    return keyValuePair[1];
		}
     }
}