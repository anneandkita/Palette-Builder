// Color-processing utilities for Play Crafts, Inc.
const colorutils_ASCENDING = 0;
const colorutils_DESCENDING = 1;

// take an image, return a list of colors used in that image sorted by most used to least used
function get_colors (img, context, maxColors)
{
	var frame = document.getElementById('UIframe');
	var imgData;
	
	if (typeof(maxColors) === 'undefined') maxColors = 16;

	imgData = context.getImageData(0, 0, frame.width, frame.height);
	
	// Store the RGB values in an array format suitable for quantize function
    var pixelArray = [];
    for (var i = 0, r, g, b, a; i < imgData.data.length; i+=4) {
        r = imgData.data[i];
        g = imgData.data[i + 1];
        b = imgData.data[i + 2];
        a = imgData.data[i + 3];
		
        // If pixel is mostly opaque
      //  if (a >= 125) {
           // if (!(r > 250 && g > 250 && b > 250)) { // if we want white to be an available color, remove this line
                pixelArray.push([r, g, b]);
          //  }
    //    }
    }
	
	// Send array to quantize function which clusters values
    // using median cut algorithm, and finds the most common colors
	// this is a lot nicer than our previous function, supposedly
    var cmap = MMCQ.quantize(pixelArray, maxColors);
    return cmap.palette();
}

