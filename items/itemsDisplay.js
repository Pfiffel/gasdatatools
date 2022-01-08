
var TIERS = 10;
var ITEM_DROPPERS = [];
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["item","monster","object"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

function parseData()
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	
	/*for (let t = 1; t < TIERS+1; t++)
	{
		SYMBIOTE_DROPPERS[t] = [];
	}
	for (let m = 0; m < gasData["monster"].length; m++)
	{
		var monster = gasData["monster"][m];
		if(monsterSkip[monster.name] != true && isSymbioteDropper(monster))
			SYMBIOTE_DROPPERS[getTier(monster.xp)-2].push(monster);
	}*/
	var totalAmount = 0;
	for (let t = 1; t < TIERS+1; t++)
	{
		var amount = GetItemAmount(t, 1, 0);
		totalAmount += GetItemAmount(t, -1, -1);
		var headerCell = makeHeaderCell(colorWrap("Tier " + t, TIER_COLORS[t]) + " - " + amount + " total<br/>", th);//From: 
		/*for (let i = 0; i < SYMBIOTE_DROPPERS[t].length; i++)
		{
			var divSprite = document.createElement('div');
			divSprite.classList.add("inline");
			divSprite.appendChild(draw(SYMBIOTE_DROPPERS[t][i],0.25));
			headerCell.appendChild(divSprite);
		}*/
	}
	let tr = tbl.insertRow();
	for (let t = 1; t < TIERS+1; t++)
	{
		var cell = makeCell("", tr);
		cell.appendChild(MakeTieredItemList(t));
	}
	tableOutput.appendChild(MakeTextDiv("<h1>Items (" + totalAmount + " total)</h1>"));
	tableOutput.appendChild(MakeTextDiv("<h2>Tiered</h2>"));
	tableOutput.appendChild(tbl);
	tableOutput.appendChild(MakeTextDiv("<h2>2-Statted</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,2,0));
	tableOutput.appendChild(MakeTextDiv("<h2>Precursor Tech</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>Usage Stats</h2>"));
	tableOutput.appendChild(showUsage(STAT_TYPES));
	//tableOutput.appendChild(showUsage(ACTIVE_WHILE_NAMES));
}
function GetItemAmount(tier, statAmount, precursor)
{
	var amount = 0;
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(ItemIsNot(item, tier, statAmount, precursor)) continue;
		amount++;
	}
	return amount;
}
function ItemIsNot(item, tier, statAmount, precursor)
{
	if(item.precursorTech == undefined) item.precursorTech = 0;
	if(item.credits != tier) return true;
	if(precursor != -1 && item.precursorTech != precursor) return true;
	if(statAmount != -1 && item.effects.length != statAmount) return true;
	return false;
}
function MakeSpecificTable(startTier, statAmount, precursor)
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	let tr = tbl.insertRow();
	for (let t = startTier; t < TIERS+1; t++)
	{
		var amount = GetItemAmount(t, statAmount, precursor);
		if(amount == 0) continue;
		makeHeaderCell(colorWrap("Tier " + t, TIER_COLORS[t]) + " - " + amount + " total<br/>", th);
		var cell = makeCell("", tr);
		cell.appendChild(MakeSpecificItemList(t, statAmount, precursor));
	}
	return tbl;
}
function MakeSpecificItemList(tier, statAmount, precursor)
{
	var div = document.createElement('div');
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(ItemIsNot(item, tier, statAmount, precursor)) continue;
		var tbl = MakeStatsTable(item, item.credits);
		tbl.classList.add("inline");
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
