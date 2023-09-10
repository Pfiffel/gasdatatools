
var TIERS = 10;
var ITEM_DROPPERS = [];
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["item","monster","object","globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");

var itemTypeCB = [];
for(var i in SLOT_TYPES)
{
	if(i == 5) continue; // skip Equipment
	var type = SLOT_TYPES[i];
	itemTypeCB[i] = makeInputCheckbox(type[1], RefreshLists, filters, true);
}
function FilterCheck(item)
{
	for(var i in itemTypeCB)
	{
		var cb = itemTypeCB[i];
		var type = SLOT_TYPES[i];
		if(item[type[2]] == 1 && cb.checked) return true;
	}
	return false;
}
function RefreshLists()
{
	tableOutput.innerHTML = "";
	MakeList();
}
function parseData()
{
	var h1List = document.createElement("h1");
	h1List.textContent = "Items (" + gasData["item"].length + " total)";
	header.appendChild(h1List);
	RefreshLists();
}
function MakeList()
{
	tableOutput.appendChild(MakeTextDiv("<h2>Item Limits Per Run</h2>"));
	tableOutput.appendChild(MakeItemLimitTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Tiered</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,1,0,0,-1,0));
	tableOutput.appendChild(MakeTextDiv("<h2>Rare</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,-1,0,1,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>2-Statted</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,2,0,0,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>Precursor Tech</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,-1,1,0,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>Enhancement Modules</h2>"));
	tableOutput.appendChild(MakeSpecificTable(0,-1,0,-1,1,0));
	tableOutput.appendChild(MakeTextDiv("<h2>Usage Stats</h2>"));
	tableOutput.appendChild(showUsage(STAT_TYPES));
	tableOutput.appendChild(showUsage(TRIGGERED_TRIGGER_EFFECTS));
	//tableOutput.appendChild(showUsage(ACTIVE_WHILE_NAMES));
}
function MakeItemLimitTable()
{
	let limits = GetGlobals().tieredItemLimits;
	let tbl = document.createElement('table');
	let thE = tbl.insertRow();
	makeHeaderCell("Tier", thE);
	makeHeaderCell("Limit", thE);
	for (let i = 0; i < limits.length; i++)
	{
		var type = limits[i];
		let trE = tbl.insertRow();
		makeCell(colorWrap("Tier " + type.tier, TIER_COLORS[type.tier]), trE);
		makeCell(type.limit, trE);
	}
	return tbl;
}
function GetItemAmount(tier, statAmount, precursor, rare, boon)
{
	var amount = 0;
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(ItemIsNot(item, tier, statAmount, precursor, rare, boon)) continue;
		amount++;
	}
	return amount;
}
function ItemIsNot(item, tier, statAmount, precursor, rare, boon)
{
	if(item.rare == undefined) item.rare = 0;
	if(rare != -1 && item.rare != rare) return true;
	if(item.boon == undefined) item.boon = 0;
	if(boon != -1 && item.boon != boon) return true;
	if(item.credits != tier) return true;
	if(item.precursorTech == undefined) item.precursorTech = 0;
	if(precursor != -1 && item.precursorTech != precursor) return true;
	if(statAmount != -1 && item.effects.length != statAmount) return true;
	return false;
}
function MakeSpecificTable(startTier, statAmount, precursor, rare, boon, inline)
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	let tr = tbl.insertRow();
	for (let t = startTier; t < TIERS+1; t++)
	{
		var amount = GetItemAmount(t, statAmount, precursor, rare, boon);
		if(amount == 0) continue;
		makeHeaderCell(colorWrap("Tier " + t, TIER_COLORS[t]) + ((boon == 1) ? (" - " + MODULE_CREDITS[t] + " Credits") :"") + " - " + amount + " total<br/>", th); MODULE_CREDITS
		var cell = makeCell("", tr);
		cell.appendChild(MakeSpecificItemList(t, statAmount, precursor, rare, boon, inline));
	}
	return tbl;
}
function MakeSpecificItemList(tier, statAmount, precursor, rare, boon, inline)
{
	var div = document.createElement('div');
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(!FilterCheck(item)) continue;
		if(ItemIsNot(item, tier, statAmount, precursor, rare, boon)) continue;
		var tbl = MakeStatsTable(item, item.credits);
		if(inline) tbl.classList.add("inline");
		div.appendChild(tbl);
	}
	return div;
}
function MakeTieredItemList(tier)
{
	var div = document.createElement('div');
	for (var stat in STAT_TYPES)
	{
		var type = STAT_TYPES[stat][1];
		var item = GetTieredItemForStatType(tier, stat);
		if(item == undefined) continue;
		let tbl = MakeStatsTable(item, tier);
		div.appendChild(tbl);
	}
	return div;
}
function GetTieredItemForStatType(tier, type)
{
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(item.credits == tier)
			if(item.effects.length == 1)
				if(item.effects[0].data.statType == type) return item;
	}
}
