// Color-processing utilities for Play Crafts, Inc.
var colorutils_ASCENDING = 0;
var colorutils_DESCENDING = 1;

// reduce colors in image
function reduce(val) {
    return Math.round(val/8)*8;
}

// if the two colors are within the tolerated distance, they are similar (return true)
// otherwise return false
function similar (color1, color2, tolerance) {
    if (typeof(tolerance) === 'undefined') tolerance = 50;

    var distance = Math.pow((color1.CIEL - color2.CIEL), 2);
    distance += Math.pow((color1.CIEa - color2.CIEa), 2);
    distance += Math.pow((color1.CIEb - color2.CIEb), 2);
    distance = Math.pow(distance, 0.5);

    if (distance <= tolerance)
        return true;

    return false;
}

function rgb2lab(color)
{
    // Step 1: RGB to XYZ
    // Convert from 0-255 to 0-1
    var red = ( color.r / 255 )
    var green = ( color.g / 255 )
    var blue = ( color.b / 255 )

    if ( red > 0.04045 )
        red = Math.pow((red + 0.055) / 1.055, 2.4);
    else
        red = red / 12.92;
    if ( green > 0.04045 )
        green = Math.pow((green + 0.055) / 1.055, 2.4);
    else
        green = green / 12.92;
    if ( blue > 0.04045 )
        blue = Math.pow((blue + 0.055) / 1.055, 2.4);
    else
        blue = blue / 12.92;

    red *= 100;
    green *= 100;
    blue *= 100;

//Observer. = 2°, Illuminant = D65
    var X = red * 0.4124 + green * 0.3576 + blue * 0.1805;
    var Y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    var Z = red * 0.0193 + green * 0.1192 + blue * 0.9505;

    // Step 2: XYZ to L*ab
    X = X / 95.047;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
    Y = Y / 100.000;          //ref_Y = 100.000
    Z = Z / 108.883;          //ref_Z = 108.883

    if ( X > 0.008856 )
        X = Math.pow(X, ( 1/3 ));
    else
        X = ( 7.787 * X ) + ( 16 / 116 );
    if ( Y > 0.008856 )
        Y = Math.pow(Y, ( 1/3 ));
    else
        Y = ( 7.787 * Y ) + ( 16 / 116 );
    if ( Z > 0.008856 )
        Z = Math.pow(Z, ( 1/3 ));
    else
        Z = ( 7.787 * Z ) + ( 16 / 116 );

    var L = ( 116 * Y ) - 16;
    var a = 500 * ( X - Y );
    var b = 200 * ( Y - Z );

    return {CIEL: L, CIEa: a, CIEb:b};
}

// take an image, return a list of colors used in that image sorted by most used to least used
function get_colors (img, context, maxColors)
{
	var frame = document.getElementById('imgFrame');
	var imgData;

	if (typeof(maxColors) === 'undefined') maxColors = 16;

	imgData = context.getImageData(0, 0, img.width, img.height);
	
    var pixelArray = [];

    for (var i = 0, red, green, blue, alpha; i < imgData.data.length; i+=4) {
        red = reduce(imgData.data[i]);
        green = reduce(imgData.data[i + 1]);
        blue = reduce(imgData.data[i + 2]);
        alpha = imgData.data[i + 3];
		var Lab = rgb2lab({r: red, g: green, b: blue});

        // If pixel is mostly opaque
        if (alpha >= 125)
        {
            var found = false;
            // check if pixel is already in array
            for (var j=0; j<pixelArray.length; j++)
            {
                // TODO: convert to L*ab space
                // if the color is within the threshold limits of a previously stored color, increase the count
                if (similar(Lab, pixelArray[j], 20))
                {
                    pixelArray[j].count++;
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                pixelArray.push({r: red, g: green, b: blue, CIEL: Lab.CIEL, CIEa: Lab.CIEa, CIEb: Lab.CIEb, count: 1 });
            }
        }
    }

    // sort array in descending order based on their counts
    pixelArray.sort(function (a, b) { return b.count - a.count; });

    return pixelArray;
	
}

