var tableOutput = document.getElementById("tableOutput");
var datatypes = ["globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");

function parseData() {
	let globals = GetGlobals();
	let glossary = globals.glossary;
	let divH1 = makeDiv("<h1>Glossary</h1>", tableOutput);
	for (let i = 0; i < glossary.length; i++) {
		var entry = glossary[i];
		let divT = makeDiv(entry.term, tableOutput);
		divT.classList.add("glossary_term");
		let divD = makeDiv(entry.definition.replace(/(?:\r\n|\r|\n)/g, '<br>'), tableOutput);
		divD.classList.add("glossary_definition");
	}
	let divH2 = makeDiv("<h1>Stat Explanations</h1>", tableOutput);
	let statExplanations = globals.statExplanations;
	for (let i = 0; i < statExplanations.length; i++) {
		var entry = statExplanations[i];
		let divT = makeDiv(entry.term, tableOutput);
		divT.classList.add("glossary_term");
		let divD = makeDiv(entry.definition.replace(/(?:\r\n|\r|\n)/g, '<br>'), tableOutput);
		divD.classList.add("glossary_definition");
	}
}