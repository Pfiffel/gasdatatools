
var TIERS = 6;
var SYMBIOTE_DROPPERS = [];
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["symbiote", "monster", "object", "speaker", "globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");

var showDroppers = makeInputCheckbox("Show Source Enemies", RefreshLists, filters, true);
var showPortraits = makeInputCheckbox("Show Portraits", RefreshLists, filters, true);
var showDescriptions = makeInputCheckbox("Show Descriptions", RefreshLists, filters, true);
var showQuotes = makeInputCheckbox("Show Quotes", RefreshLists, filters, false);
var showOnlyDefault = makeInputCheckbox("Only Show Default Symbiotes", RefreshLists, filters, false);

var defaultSymbiotes;

function parseData() {
	defaultSymbiotes = GetGlobals().defaultSymbiotes;
	RefreshLists();
}
function RefreshLists() {
	tableOutput.innerHTML = "";
	header.innerHTML = "";
	var tbl = document.createElement('table');
	let th = tbl.insertRow();

	for (let t = 1; t < TIERS + 1; t++) {
		SYMBIOTE_DROPPERS[t] = [];
	}
	for (let m = 0; m < gasData["monster"].length; m++) {
		var monster = gasData["monster"][m];
		if (monsterSkip[monster.name] != true && !monster.name.includes("Nest") && isSymbioteDropper(monster))
			SYMBIOTE_DROPPERS[getTier(monster.xp) - 2].push(monster);
	}
	var totalAmount = 0;
	var combinations = 1;
	for (let t = 1; t < TIERS + 1; t++) {
		var amount = GetSymbAmount(t);
		combinations *= amount;
		totalAmount += amount;
		var headerCell = makeHeaderCell("Tier " + t + " - " + colorWrap(TIER_NAMES[t] + " Symbiotes", TIER_COLORS[t]) + " - " + amount + " total", th);

		if (showDroppers.checked) {
			headerCell.innerHTML += "<br/>From: ";
			for (let i = 0; i < SYMBIOTE_DROPPERS[t].length; i++) {
				var divSprite = document.createElement('div');
				divSprite.classList.add("inline");
				divSprite.appendChild(draw(SYMBIOTE_DROPPERS[t][i], 0.25));
				headerCell.appendChild(divSprite);
			}
		}
	}
	let tr = tbl.insertRow();
	for (let t = 1; t < TIERS + 1; t++) {
		var cell = makeCell("", tr);
		cell.appendChild(parseTierList(t));
	}
	var combos = ", " + combinations + " total combinations";
	header.appendChild(MakeTextDiv("<h1>Symbiotes (" + totalAmount + " total)</h1>"));
	tableOutput.appendChild(tbl);
	tableOutput.appendChild(showUsage(STAT_TYPES));
	tableOutput.appendChild(showUsage(ACTIVE_WHILE_NAMES));
	tableOutput.appendChild(showUsage(TRIGGERED_TRIGGER_EFFECTS));
}
function GetSymbAmount(t) {
	var amount = 0;
	for (var i = 0; i < gasData["symbiote"].length; i++) {
		var symb = gasData["symbiote"][i];
		if (symb.tier != t) continue;
		amount++;
	}
	return amount;
}
function parseTierList(t) {
	var div = document.createElement('div');
	for (var i = 0; i < gasData["symbiote"].length; i++) {
		var symb = gasData["symbiote"][i];
		if (symb.tier != t) continue;
		if (showOnlyDefault.checked && !IsStarter(symb)) continue;
		var cont = document.createElement('div');
		var tbl = MakeStatsTable(symb, symb.tier, true, showPortraits.checked, showDescriptions.checked, showQuotes.checked);
		/*
		tbl.classList.add("inline");
		var image = new Image();
		image.src = "https://gasgame.net/portrait/"+symb.name+".png";
		image.height = "64";
		cont.appendChild(image);*/
		cont.appendChild(tbl);
		div.appendChild(cont);
	}
	return div;
}
function IsStarter(symb) {
	for (let i in defaultSymbiotes) {
		if (defaultSymbiotes[i] == symb.name) return true;
	}
	return false;
}