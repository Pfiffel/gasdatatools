function gradientFromHex(c1, c2, f)
{
	var rgb1 = hexToRgb(c1);
	var rgb2 = hexToRgb(c2);
	var r = parseInt(Math.min(rgb1.r, rgb2.r)+Math.abs(rgb2.r - rgb1.r)*f);
	var g = parseInt(Math.min(rgb1.g, rgb2.g)+Math.abs(rgb2.g - rgb1.g)*f);
	var b = parseInt(Math.min(rgb1.b, rgb2.b)+Math.abs(rgb2.b - rgb1.b)*f);
	return rgbToHex(r, g, b);
}
function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function numberToHex(i) {
	return "#"+padHex(Number(i).toString(16));
}
function padHex(s){
	while (s.length < 6) {s = "0" + s;}
	return s;
}
function colorWrap(string, color){
	return "<span style=\"color:"+color+";\">"+string+"</span>";
}