
var TIERS = 10;
var ITEM_DROPPERS = [];
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["item","addon","monster","object","globals","symbiote","champion"]; // for utilGAS to load files, calls parseData once completed
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
	tableOutput.appendChild(MakeSpecificTable(1,-1,0,0,-1,0,1));
	tableOutput.appendChild(MakeTextDiv("<h2>Rare</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,-1,0,1,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>2-Statted Boss Loot</h2>"));
	tableOutput.appendChild(MakeSpecificTable(7,2,0,0,-1,1,0));
	tableOutput.appendChild(MakeTextDiv("<h2>Precursor Tech</h2>"));
	tableOutput.appendChild(MakeSpecificTable(1,-1,1,0,-1,1));
	tableOutput.appendChild(MakeTextDiv("<h2>Addons</h2>"));
	tableOutput.appendChild(MakeAddonTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Damage Types</h2>"));
	tableOutput.appendChild(DamageTypeTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Enhancement Modules</h2>"));
	tableOutput.appendChild(MakeSpecificTable(0,-1,0,-1,1,0));
	tableOutput.appendChild(MakeTextDiv("<h2>Usage Stats</h2>"));
	tableOutput.appendChild(showUsage(STAT_TYPES));
	tableOutput.appendChild(showUsage(TRIGGERED_TRIGGER_EFFECTS));
	//tableOutput.appendChild(showUsage(ACTIVE_WHILE_NAMES));
}
function DamageTypeTable()
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell(STAT_TYPES[STATS.BLAST_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.BOMB_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.MISSILE_DAMAGE][1], th);
	let tr = tbl.insertRow();
	for (let i = STATS.BLAST_DAMAGE; i <= STATS.MISSILE_DAMAGE; i++)
	{
		let cell = makeCell("", tr);
		cell.appendChild(MakeTriggerList(i));
	}
	/*let tr2 = tbl.insertRow();
	for (let i = STATS.BLAST_DAMAGE; i <= STATS.MISSILE_DAMAGE; i++)
	{
		let cell = makeCell("", tr2);
		cell.appendChild(MakePassiveList(i));
	}*/
	let tr3 = tbl.insertRow();
	for (let i = STATS.BLAST_DAMAGE; i <= STATS.MISSILE_DAMAGE; i++)
	{
		let cell = makeCell("", tr3);
		cell.appendChild(MakeSymbioteItemList(gasData.symbiote, i));
	}
	let tr4 = tbl.insertRow();
	for (let i = STATS.BLAST_DAMAGE; i <= STATS.MISSILE_DAMAGE; i++)
	{
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemList(gasData.item, i));
	}
	return tbl;
}
function MakeTriggerList(stat)
{
	var div = document.createElement('div');
	// TODO fix redundancy in playerDisplay
	for (let i = 0; i < gasData.champion.length; i++)
	{
		var player = gasData.champion[i];
		if(player.choosable != 1) continue;
		for (let t = 0; t < player.triggers.length; t++)
		{
			var trigger = player.triggers[t];
			var hasEffect = DataHasEffectTrigger(trigger, stat);
			if(hasEffect)
			{
				trigger.championName = player.name;
				let tbl = MakeStatsTable(trigger, 0, false, false, false, false, t);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
		for (let t = 0; t < player.passives.length; t++)
		{
			var pretendItem = {};
			pretendItem.name = player.passiveName;
			pretendItem.effects = player.passives;
			var hasEffect = DataHasEffect(pretendItem.effects, stat);
			if(hasEffect)
			{
				pretendItem.championName = player.name;
				let tbl = MakeStatsTable(pretendItem, 0);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
	}
	return div;
}
/*function MakePassiveList(stat)
{
	var div = document.createElement('div');
	// TODO fix redundancy in playerDisplay
	for (let i = 0; i < gasData.champion.length; i++)
	{
		var player = gasData.champion[i];
		if(player.choosable != 1) continue;
		for (let t = 0; t < player.passives.length; t++)
		{
			var pretendItem = {};
			pretendItem.name = player.passiveName;
			pretendItem.effects = player.passives;
			var hasEffect = DataHasEffect(pretendItem.effects, stat);
			if(hasEffect)
			{
				pretendItem.championName = player.name;
				let tbl = MakeStatsTable(pretendItem, 0);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
	}
	return div;
}*/
function MakeSymbioteItemList(type, stat)
{
	var div = document.createElement('div');
	for (let i = 0; i < type.length; i++)
	{
		var thing = type[i];
		try{
			var hasEffect = DataHasEffect(thing.effects, stat);
			if(hasEffect)
			{
				let tbl;
				if(type == gasData.symbiote)
					tbl = MakeStatsTable(thing, thing.tier, true, false, false);
				else
					tbl = MakeStatsTable(thing, thing.credits);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
		catch(e)
		{
			console.log(thing.name);
			console.log(e);
		}
	}
	return div;
}
function DataHasEffect(effect, stat)
{
	for (let p = 0; p < effect.length; p++)
	{
		var params = effect[p].data.params;
		if(params == undefined) return false;
		if(
			(IsBlast(params) && stat == STATS.BLAST_DAMAGE) || 
			(IsBomb(params) && stat == STATS.BOMB_DAMAGE) || 
			(IsMissile(params) && stat == STATS.MISSILE_DAMAGE)
			)
		{
			return true;
		}
	}
	return false;
}
function DataHasEffectTrigger(data, stat)
{
	for (let p = 0; p < data.params.length; p++)
	{
		var params = data.params[p];
		if(
			(IsBlast(params) && stat == STATS.BLAST_DAMAGE) || 
			(IsBomb(params) && stat == STATS.BOMB_DAMAGE) || 
			(IsMissile(params) && stat == STATS.MISSILE_DAMAGE)
			)
		{
			return true;
		}
	}
	return false;
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
function GetItemAmount(tier, statAmount, precursor, rare, boon, overworld)
{
	var amount = 0;
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(ItemIsNot(item, tier, statAmount, precursor, rare, boon, overworld)) continue;
		amount++;
	}
	return amount;
}
function ItemIsNot(item, tier, statAmount, precursor, rare, boon, overworld)
{
	if(item.rare == undefined) item.rare = 0;
	if(rare != -1 && item.rare != rare) return true;
	if(item.boon == undefined) item.boon = 0;
	if(boon != -1 && item.boon != boon) return true;
	if(item.credits != tier) return true;
	if(item.precursorTech == undefined) item.precursorTech = 0;
	if(precursor != -1 && item.precursorTech != precursor) return true;
	if(statAmount != -1 && item.effects.length != statAmount) return true;
	if(overworld != -1 && item.overworldDrop != overworld) return true;
	return false;
}
function MakeSpecificTable(startTier, statAmount, precursor, rare, boon, inline, overworld = -1)
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	let tr = tbl.insertRow();
	for (let t = startTier; t < TIERS+1; t++)
	{
		var amount = GetItemAmount(t, statAmount, precursor, rare, boon, overworld);
		if(amount == 0) continue;
		makeHeaderCell(colorWrap("Tier " + t, TIER_COLORS[t]) + ((boon == 1) ? (" - " + MODULE_CREDITS[t] + " Credits") :"") + " - " + amount + " total<br/>", th);
		var cell = makeCell("", tr);
		cell.appendChild(MakeSpecificItemList(t, statAmount, precursor, rare, boon, inline, overworld));
	}
	return tbl;
}
function MakeSpecificItemList(tier, statAmount, precursor, rare, boon, inline, overworld)
{
	var div = document.createElement('div');
	var tempItems = [];
	for (var i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(!FilterCheck(item)) continue;
		if(ItemIsNot(item, tier, statAmount, precursor, rare, boon, overworld)) continue;
		tempItems.push(item);
	}
	tempItems.sort((a, b) => ItemSort(a, b));
	for (var i = 0; i < tempItems.length; i++)
	{
		var item = tempItems[i];
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
function MakeAddonTable()
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	let tr = tbl.insertRow();
	for (let t = 0; t < TIERS; t++)
	{
		var amount = GetAddonAmount(t);
		if(amount == 0) continue;
		makeHeaderCell(colorWrap("Tier " + (t+1) + " - " + ADDON_TIER_NAMES[t], TIER_COLORS[t+1]) + " - " + amount + " total<br/>", th);
		var cell = makeCell("", tr);
		cell.appendChild(MakeAddonList(t));
	}
	return tbl;
}
function GetAddonAmount(tier)
{
	var amount = 0;
	for (var i = 0; i < gasData["addon"].length; i++)
	{
		var item = gasData["addon"][i];
		if(item.rarity != tier) continue;
		amount++;
	}
	return amount;
}
function MakeAddonList(tier)
{
	var div = document.createElement('div');
	for (var i = 0; i < gasData["addon"].length; i++)
	{
		var item = gasData["addon"][i];
		if(item.rarity != tier) continue;
		var tbl = MakeStatsTable(item);
		tbl.classList.add("inline");
		div.appendChild(tbl);
	}
	return div;
}