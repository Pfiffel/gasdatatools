
var TIERS = 6;
var SYMBIOTE_DROPPERS = [];
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["symbiote","monster","object"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

function parseData()
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	
	for (let t = 1; t < TIERS+1; t++)
	{
		SYMBIOTE_DROPPERS[t] = [];
	}
	for (let m = 0; m < gasData["monster"].length; m++)
	{
		var monster = gasData["monster"][m];
		if(monsterSkip[monster.name] != true && !monster.name.includes("Nest") && isSymbioteDropper(monster))
			SYMBIOTE_DROPPERS[getTier(monster.xp)-2].push(monster);
	}
	var totalAmount = 0;
	for (let t = 1; t < TIERS+1; t++)
	{
		var amount = GetSymbAmount(t);
		totalAmount += amount;
		var headerCell = makeHeaderCell("Tier " + t + " - " + colorWrap(TIER_NAMES[t] + " Symbiotes", TIER_COLORS[t]) + " - " + amount + " total<br/>From: ", th);
		for (let i = 0; i < SYMBIOTE_DROPPERS[t].length; i++)
		{
			var divSprite = document.createElement('div');
			divSprite.classList.add("inline");
			divSprite.appendChild(draw(SYMBIOTE_DROPPERS[t][i],0.25));
			headerCell.appendChild(divSprite);
		}
	}
	let tr = tbl.insertRow();
	for (let t = 1; t < TIERS+1; t++)
	{
		var cell = makeCell("", tr);
		cell.appendChild(parseTierList(t));
	}
	tableOutput.appendChild(MakeTextDiv("<h1>Symbiotes (" + totalAmount + " total)</h1>"));
	tableOutput.appendChild(tbl);
	tableOutput.appendChild(showUsage(STAT_TYPES));
	tableOutput.appendChild(showUsage(ACTIVE_WHILE_NAMES));
	tableOutput.appendChild(showUsage(TRIGGERED_TRIGGER_EFFECTS));
}
function GetSymbAmount(t)
{
	var amount = 0;
	for (var i = 0; i < gasData["symbiote"].length; i++)
	{
		var symb = gasData["symbiote"][i];
		if(symb.tier != t) continue;
		amount++;
	}
	return amount;
}
function parseTierList(t)
{
	var div = document.createElement('div');
	for (var i = 0; i < gasData["symbiote"].length; i++)
	{
		var symb = gasData["symbiote"][i];
		if(symb.tier != t) continue;
		var tbl = MakeStatsTable(symb, symb.tier);
		div.appendChild(tbl);
	}
	return div;
}