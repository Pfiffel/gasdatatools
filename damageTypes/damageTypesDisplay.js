
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["item", "addon", "monster", "object", "globals", "symbiote", "champion", "accolade", "globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");

function RefreshLists() {
	tableOutput.innerHTML = "";
	MakeList();
}
function parseData() {
	SetTierColorsFromGlobals();
	var h1List = document.createElement("h1");
	h1List.textContent = "Damage Types";
	header.appendChild(h1List);
	RefreshLists();
}
function MakeList() {
	tableOutput.appendChild(MakeTextDiv("<h2>Damage Type Enhancers"));
	tableOutput.appendChild(DamageTypeBoostersTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Damage Types and Where to Find Them</h2>"));
	tableOutput.appendChild(DamageTypeTable());
}
function DamageTypeTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS.BLAST_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.BOMB_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.MISSILE_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.ZAP_DAMAGE][1], th);
	let tr = tbl.insertRow();
	makeHeaderCell("Triggers & Passives", tr);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr);
		cell.appendChild(MakeTriggerList(i));
	}
	let tr3 = tbl.insertRow();
	makeHeaderCell("Symbiotes", tr3);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr3);
		cell.appendChild(MakeSymbioteItemList(gasData.symbiote, i));
	}
	let tr4 = tbl.insertRow();
	makeHeaderCell("Items", tr4);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemList(gasData.item, i));
	}
	return tbl;
}
function DamageTypeBoostersTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS.BLAST_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.BOMB_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.MISSILE_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.ZAP_DAMAGE][1], th);
	let tr2 = tbl.insertRow();
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.accolade, i));
	}
	// no symbs yet!
	/*
	let tr3 = tbl.insertRow();
	makeCell("Symbiotes", tr3);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr3);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.symbiote, i));
	}*/
	let tr4 = tbl.insertRow();
	makeHeaderCell("Tiered Items", tr4);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i, false));
	}
	let tr5 = tbl.insertRow();
	makeHeaderCell("Rare Items", tr5);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i, true));
	}
	return tbl;
}
function MakeTriggerList(stat) {
	var div = document.createElement('div');
	// TODO fix redundancy in playerDisplay
	for (let i = 0; i < gasData.champion.length; i++) {
		var player = gasData.champion[i];
		if (player.choosable != 1) continue;
		for (let t = 0; t < player.triggers.length; t++) {
			var trigger = player.triggers[t];
			var hasEffect = DataHasEffectTrigger(trigger, stat);
			if (hasEffect) {
				trigger.championName = player.name;
				let tbl = MakeStatsTable(trigger, 0, false, false, false, false, t);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
		for (let t = 0; t < player.passives.length; t++) {
			var pretendItem = {};
			pretendItem.name = player.passiveName;
			pretendItem.effects = player.passives;
			var hasEffect = DataHasEffect(pretendItem.effects, stat);
			if (hasEffect) {
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
function MakeSymbioteItemListBoosters(type, stat, isRare) {
	var div = document.createElement('div');
	for (let i = 0; i < type.length; i++) {
		var thing = type[i];
		try {
			console.log(thing.name, stat)
			var hasEffect = DataHasEffectBooster(thing.effects, stat);
			if (hasEffect) {
				let tbl;
				if (type == gasData.accolade)
					tbl = MakeStatsTable(thing, 0, false, false, false, false, false, false, true);
				else if (type == gasData.symbiote)
					tbl = MakeStatsTable(thing, thing.tier, true, false, false);
				else if (type == gasData.item && isRare && thing.rare == 1)
					tbl = MakeStatsTable(thing, thing.credits);
				else if (type == gasData.item && !isRare && thing.rare == 0)
					tbl = MakeStatsTable(thing, thing.credits);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
		catch (e) {
			console.log(thing.name);
			console.log(e);
		}
	}
	return div;
}
function MakeSymbioteItemList(type, stat) {
	var div = document.createElement('div');
	for (let i = 0; i < type.length; i++) {
		var thing = type[i];
		try {
			var hasEffect = DataHasEffect(thing.effects, stat);
			if (hasEffect) {
				let tbl;
				if (type == gasData.symbiote)
					tbl = MakeStatsTable(thing, thing.tier, true, false, false);
				else
					tbl = MakeStatsTable(thing, thing.credits);
				tbl.classList.add("inline");
				div.appendChild(tbl);
				continue;
			}
		}
		catch (e) {
			console.log(thing.name);
			console.log(e);
		}
	}
	return div;
}
function DataHasEffect(effect, stat) {
	for (let p = 0; p < effect.length; p++) {
		var params = effect[p].data.params;
		if (params == undefined) return false;
		if (
			(IsBlast(params) && stat == STATS.BLAST_DAMAGE) ||
			(IsBomb(params) && stat == STATS.BOMB_DAMAGE) ||
			(IsMissile(params) && stat == STATS.MISSILE_DAMAGE) ||
			(IsZap(params) && stat == STATS.ZAP_DAMAGE)
		) {
			return true;
		}
	}
	return false;
}
function DataHasEffectBooster(effects, stat) {
	var stats = STATS_BOOSTERS[stat];
	for (var iS in stats) {
		let i = stats[iS];
		if(IsBoosterFor(effects, i)) return true;
	}
	for (let p = 0; p < effect.length; p++) {
		var params = effect[p].data.params;
		if (params == undefined) return false;
		
		
	}
	return false;
}
function DataHasEffectTrigger(data, stat) {
	for (let p = 0; p < data.params.length; p++) {
		var params = data.params[p];
		if (
			(IsBlast(params) && stat == STATS.BLAST_DAMAGE) ||
			(IsBomb(params) && stat == STATS.BOMB_DAMAGE) ||
			(IsMissile(params) && stat == STATS.MISSILE_DAMAGE) ||
			(IsZap(params) && stat == STATS.ZAP_DAMAGE)
		) {
			return true;
		}
	}
	return false;
}