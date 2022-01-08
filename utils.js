function degToRad(deg){
	return deg * Math.PI/180;
}
function loadJsonFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
	try //catches NS_ERROR_DOM_BAD_URI under linux
	{
		rawFile.send(null);
	}
	catch(exception)
	{
		console.log("Bleh.");
	}
}
function round(fNumber, iDecimals){
	iDecimals = typeof iDecimals !== 'undefined' ? iDecimals : 0;
	var iMult = Math.pow(10, iDecimals);
	return Math.round(fNumber*iMult)/iMult;
}
function pad(n, iMaxB, iMaxA){
	var s = n + "";
	var a = s.split(".");
	var sBef = a[0];
	
	s = addZeros(sBef.length, iMaxB) + sBef;
	var sAft = a[1];
	if(sAft == undefined) sAft = "";
	if(iMaxA != undefined) 
	{
		s += "."+ sAft + addZeros(sAft.length, iMaxA);
	}
	return s;
}
function addZeros(iL, iM){
	var s = "";
	for (var i = iL; i < iM; i++) s += "0";
	return s;
}
function colorWrap(string, color){
	return "<span style=\"color:"+color+";\">"+string+"</span>";
}
function classWrap(string, cssClass){
	return "<span class=\""+cssClass+"\">"+string+"</span>";
}
function goodBad(value, invert){
	if(value > 0)
		return colorWrap(value, invert ? "FF8080" : "80FF80");
	else if(value < 0)
		return colorWrap(value, invert ? "80FF80" : "FF8080");
	else
		return value;
}
function getPlural(amount, unit){
	var s = amount + " " + unit;
	if(amount != 1)
		return s+"s";
	else
		return s;
}
function getPluralUnitOnly(amount, unit){
	var s = unit;
	if(amount != 1)
		return s+"s";
	else
		return s;
}
function opBonusMalus(amount){
	return (amount > 0) ? "+" + amount : amount;
}
function trimList(sList){
	return sList.substring(0, sList.length - 1);
}
function nameEndsIn(name, string){
	return (name.indexOf(string) !== -1) && (name.length - name.indexOf(string) == string.length);
}
function bObjectIsEmpty(obj){
	return (Object.entries(obj).length === 0 && obj.constructor === Object);
}
function percToString(f){
	return round(f * 100, 2) + "%";
}
function padHex(s){
	while (s.length < 6) {s = "0" + s;}
	return s;
}
function unCaps(s){
	return s.charAt(0) + s.substr(1).toLowerCase();
}
function amountToString(i){
	return (i >= 0 ? "+" + i : i) + "% ";
}
function makeHeaderCell(innerHTML, container, className)
{
	let headerCell = document.createElement("th");
	if(className != undefined) headerCell.classList.add(className);
	headerCell.innerHTML = innerHTML;
	container.appendChild(headerCell);
	return headerCell;
}
function makeCell(innerHTML, container, className)
{
	let cell = container.insertCell();
	if(className != undefined) cell.classList.add(className);
	cell.innerHTML = innerHTML;
	return cell;
}
function makeCellE(innerElement, container, className)
{
	let cell = container.insertCell();
	if(className != undefined) cell.classList.add(className);
	cell.appendChild(innerElement);
	return cell;
}
function addLine(text, container)
{
	var line = document.createElement('div');
	line.innerHTML = text;
	container.appendChild(line);
	return line;
}
function makeDiv(text, container)
{
	let div = document.createElement('div');
	div.innerHTML = text;
	container.appendChild(div);
	return div;
}
function MakeTextDiv(text)
{
	var div = document.createElement('div');
	div.innerHTML = text;
	return div;
}