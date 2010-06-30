
/**
 * Convert a string to a number (compatible with k/m/g unit)
 * @param str {str} the string reprensenting the size (e.g. 300m)
*/
var string_to_size	= function(str)
{
	var units	= {
		'b'	: 1,
		'k'	: 1*1024,
		'm'	: 1*1024*1024,
		'g'	: 1*1024*1024*1024
	};
	var last_char	= str[str.length-1].toLowerCase();
	var unit	= units[last_char] || 1;
	var size	= parseInt(str)*unit;
	return size;	
}

exports.string_to_size	= string_to_size;