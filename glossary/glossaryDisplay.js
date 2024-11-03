var tableOutput = document.getElementById("tableOutput");
var datatypes = ["globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");

function parseData() {
	let glossary = GetGlobals().glossary;
	for (let i = 0; i < glossary.length; i++) {
		var entry = glossary[i];
		let divT = makeDiv("<b>"+entry.term+"</b>", tableOutput);
		divT.classList.add("glossary_term");
		let divD = makeDiv(entry.definition.replace(/(?:\r\n|\r|\n)/g, '<br>'), tableOutput);
		divD.classList.add("glossary_definition");
	}
}