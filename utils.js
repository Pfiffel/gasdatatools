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
function makeCleanCell(innerHTML, container, className)
{
	let cell = container.insertCell();
	if(className != undefined) cell.classList.add(className);
	cell.innerHTML = innerHTML != undefined && innerHTML != NaN ? innerHTML : "";
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
function secondsToClock(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	return (d > 0 ? (d + "d ") : "") + pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2);
}
function secondsToDhms(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function isLastKey(string, object) {
  var keyList = Object.keys(object);
	if(keyList[keyList.length-1] == string)
	{
		return true;
	}
	return false;
}
function getCurrentPage(){
	var pathArray = location.href.replace(/[^/]*$/, '').split('/');
	return pathArray[pathArray.length-2];
}