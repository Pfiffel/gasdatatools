
var tableOutput = document.getElementById("tableOutput");

var datatypes = ["item", "addon", "monster", "object", "globals", "symbiote", "champion", "accolade", "globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var tankIndex = {};

function RefreshLists() {
	tableOutput.innerHTML = "";
	MakeList();
}
function parseData() {
	SetTierColorsFromGlobals();
	for (let i = 0; i < gasData.champion.length; i++) {
		var player = gasData.champion[i];
		tankIndex[player.name] = i;
	}
	var h1List = document.createElement("h1");
	h1List.textContent = "Timed Effects and Damage Types";
	header.appendChild(h1List);
	RefreshLists();
}
function MakeList() {
	tableOutput.appendChild(MakeTextDiv("<h2>Timed Effect Enhancers"));
	tableOutput.appendChild(TimedEffectBoostersTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Timed Effect and Duration Sources"));
	tableOutput.appendChild(TimedEffectTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Damage Type Enhancers"));
	tableOutput.appendChild(DamageTypeBoostersTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Damage Types and Where to Find Them</h2>"));
	tableOutput.appendChild(DamageTypeTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Elemental Enhancers"));
	tableOutput.appendChild(ElementalBoostersTable());
	tableOutput.appendChild(MakeTextDiv("<h2>Elemental Initiators"));
	tableOutput.appendChild(ElementalTable());
}
function TimedEffectBoostersTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS_TIMED.TIMED_EFFECT_FIRE_RATE][1], th);
	makeHeaderCell(STAT_TYPES[STATS_TIMED.DURATION][1], th);
	let tr2 = tbl.insertRow();
	/*
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.accolade, i));
	}
	let tr4 = tbl.insertRow();
	makeHeaderCell("Tiered Items", tr4);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i, false));
	}*/
	let tr5 = tbl.insertRow();
	makeHeaderCell("Items", tr5);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i));
	}
	/*
	let tr6 = tbl.insertRow();
	makeHeaderCell("Addons", tr6);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr6);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.addon, i));
	}*/
	return tbl;
}
function TimedEffectTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell("Timed Effect", th);
	makeHeaderCell("Effect Duration", th);
	let tr = tbl.insertRow();
	makeHeaderCell("Triggers & Passives", tr);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr);
		cell.appendChild(MakeTriggerList(i));
	}
	let tr2 = tbl.insertRow();
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemList(gasData.accolade, i));
	}
	let tr3 = tbl.insertRow();
	makeHeaderCell("Symbiotes", tr3);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr3);
		cell.appendChild(MakeSymbioteItemList(gasData.symbiote, i));
	}
	let tr4 = tbl.insertRow();
	makeHeaderCell("Items", tr4);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemList(gasData.item, i));
	}
	let tr5 = tbl.insertRow();
	makeHeaderCell("Addons", tr5);
	for (var stat in STATS_TIMED) {
		let i = STATS_TIMED[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemList(gasData.addon, i));
	}
	return tbl;
}
function ElementalTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell("Burning", th);
	makeHeaderCell("Chilled/Frozen", th);
	let tr = tbl.insertRow();
	makeHeaderCell("Triggers & Passives", tr);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr);
		cell.appendChild(MakeTriggerList(i));
	}
	let tr2 = tbl.insertRow();
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemList(gasData.accolade, i));
	}
	let tr3 = tbl.insertRow();
	makeHeaderCell("Symbiotes", tr3);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr3);
		cell.appendChild(MakeSymbioteItemList(gasData.symbiote, i));
	}
	let tr4 = tbl.insertRow();
	makeHeaderCell("Items", tr4);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemList(gasData.item, i));
	}
	let tr5 = tbl.insertRow();
	makeHeaderCell("Addons", tr5);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemList(gasData.addon, i));
	}
	return tbl;
}
function ElementalBoostersTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS_ELEMENTAL.DAMAGE_VS_BURNING][1], th);
	makeHeaderCell(STAT_TYPES[STATS_ELEMENTAL.DAMAGE_VS_FROZEN][1], th);
	let tr2 = tbl.insertRow();
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.accolade, i));
	}
	/*
	let tr4 = tbl.insertRow();
	makeHeaderCell("Tiered Items", tr4);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr4);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i, false));
	}*/
	let tr5 = tbl.insertRow();
	makeHeaderCell("Items", tr5);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.item, i));
	}
	let tr6 = tbl.insertRow();
	makeHeaderCell("Addons", tr6);
	for (var stat in STATS_ELEMENTAL) {
		let i = STATS_ELEMENTAL[stat];
		let cell = makeCell("", tr6);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.addon, i));
	}
	return tbl;
}
function DamageTypeTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS.BLAST_DAMAGE][1], th);
	//makeHeaderCell(STAT_TYPES[STATS.BOMB_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.MISSILE_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.ZAP_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.DOT_DAMAGE][1], th);
	let tr = tbl.insertRow();
	makeHeaderCell("Triggers & Passives", tr);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr);
		cell.appendChild(MakeTriggerList(i));
	}
	let tr2 = tbl.insertRow();
	makeHeaderCell("Accolade Bonuses", tr2);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr2);
		cell.appendChild(MakeSymbioteItemList(gasData.accolade, i));
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
	let tr5 = tbl.insertRow();
	makeHeaderCell("Addons", tr5);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr5);
		cell.appendChild(MakeSymbioteItemList(gasData.addon, i));
	}
	return tbl;
}
function DamageTypeBoostersTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("", th);
	makeHeaderCell(STAT_TYPES[STATS.BLAST_DAMAGE][1], th);
	//makeHeaderCell(STAT_TYPES[STATS.BOMB_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.MISSILE_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.ZAP_DAMAGE][1], th);
	makeHeaderCell(STAT_TYPES[STATS.DOT_DAMAGE][1], th);
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
	let tr6 = tbl.insertRow();
	makeHeaderCell("Addons", tr6);
	for (var stat in STATS) {
		let i = STATS[stat];
		let cell = makeCell("", tr6);
		cell.appendChild(MakeSymbioteItemListBoosters(gasData.addon, i));
	}
	return tbl;
}
function MakeTriggerList(stat) {
	var div = document.createElement('div');
	//var currentPlayer = "";
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
		/*
		if (currentPlayer != player.name) {
			currentPlayer = player.name;
			// TODO only linebreak if previous tank had any entries...
			div.appendChild(document.createElement('br'));
		}
		*/
	}
	return div;
}
function MakeSymbioteItemListBoosters(type, stat, isRare) {
	var div = document.createElement('div');
	let entries = [];
	for (let i = 0; i < type.length; i++) {
		var thing = type[i];
		try {
			//console.log(thing.name, stat)
			// TODO check trigger specific boosters and add those as well (IsBooster -> ShotgunTriggerBonus, etc.)
			var hasEffect = DataHasEffectBooster(thing.effects, stat);// || DataHasEffect(thing.effects, stat);
			if (hasEffect) {
				//console.log(type == gasData.item, thing.rare, isRare, )
				let tbl;
				let sortObj = {};
				if (type == gasData.accolade) {
					tbl = MakeStatsTable(thing, 0, false, false, false, false, false, false, true);
					sortObj.t = tankIndex[thing.champion];
				}
				else if (type == gasData.symbiote) {
					tbl = MakeStatsTable(thing, thing.tier, true, false, false);
					sortObj.t = thing.tier;
				}
				else if (type == gasData.item && isRare && thing.rare == 1) {
					tbl = MakeStatsTable(thing, thing.credits);
					sortObj.t = thing.credits;
				}
				else if (type == gasData.item && !isRare && thing.rare == 0) {
					tbl = MakeStatsTable(thing, thing.credits);
					sortObj.t = thing.credits;
				}
				else if (type == gasData.item && isRare == undefined) {
					tbl = MakeStatsTable(thing, thing.credits);
					sortObj.t = thing.credits;
				}
				else if (type == gasData.addon) {
					tbl = MakeStatsTable(thing);
					sortObj.t = thing.rarity;
				}
				if (tbl == undefined) continue;
				tbl.classList.add("inline");
				sortObj.e = tbl;
				entries.push(sortObj);
				continue;
			}
		}
		catch (e) {
			console.log(thing.name);
			console.log(e);
		}
	}
	entries.sort((a, b) => (a.t - b.t));
	for (let i in entries) {
		div.appendChild(entries[i].e);
	}
	return div;
}
function MakeSymbioteItemList(type, stat) {
	var div = document.createElement('div');
	let entries = [];
	for (let i = 0; i < type.length; i++) {
		var thing = type[i];
		try {
			var hasEffect = DataHasEffect(thing.effects, stat, thing.name);
			if (hasEffect) {
				//console.log(thing.name, stat)
				let tbl;
				let sortObj = {};
				if (type == gasData.accolade) {
					tbl = MakeStatsTable(thing, 0, false, false, false, false, false, false, true);
					sortObj.t = tankIndex[thing.champion];
				}
				else if (type == gasData.symbiote) {
					tbl = MakeStatsTable(thing, thing.tier, true, false, false);
					sortObj.t = thing.tier;
				}
				else if (type == gasData.item) {
					tbl = MakeStatsTable(thing, thing.credits);
					sortObj.t = thing.credits;
				}
				else if (type == gasData.addon) {
					tbl = MakeStatsTable(thing);
					sortObj.t = thing.rarity;
				}
				tbl.classList.add("inline");
				sortObj.e = tbl;
				entries.push(sortObj);
				continue;
			}
		}
		catch (e) {
			console.log(thing.name);
			console.log(e);
		}
	}
	entries.sort((a, b) => (a.t - b.t));
	//let tempT = -1;
	for (let i in entries) {
		/*
		if (tempT != entries[i].t) {
			tempT = entries[i].t;
			div.appendChild(document.createElement('br'));
		}
		*/
		div.appendChild(entries[i].e);
	}
	return div;
}
function CheckParams(params, stat, name = "") {
	if (
		(IsBlast(params) && stat == STATS.BLAST_DAMAGE) ||
		(IsBomb(params) && stat == STATS.BOMB_DAMAGE) ||
		(IsMissile(params) && stat == STATS.MISSILE_DAMAGE) ||
		(IsZap(params) && stat == STATS.ZAP_DAMAGE) ||
		(IsDoT(params) && stat == STATS.DOT_DAMAGE) ||
		(IsFire(params) && stat == STATS_ELEMENTAL.DAMAGE_VS_BURNING) ||
		(IsFrost(params) && stat == STATS_ELEMENTAL.DAMAGE_VS_FROZEN) ||
		(IsPeriodic(params) && stat == STATS_TIMED.TIMED_EFFECT_FIRE_RATE) ||
		(IsDuration(params, name) && stat == STATS_TIMED.DURATION)
	) {
		return true;
	}
	return false;
}
function DataHasEffect(effect, stat, name = "") {
	for (let p = 0; p < effect.length; p++) {
		if (CheckParams(effect[p], stat, name))
			return true;
	}
	for (let p = 0; p < effect.length; p++) {
		var params = effect[p].data.params;
		if (params == undefined) return false;
		if (CheckParams(params, stat, name))
			return true;
	}
	return false;
}
function DataHasEffectBooster(effects, stat) {
	var stats = STATS_BOOSTERS[stat];
	for (var iS in stats) {
		let i = stats[iS];
		if (IsBoosterFor(effects, i)) return true;
	}
	return false;
}
function DataHasEffectTrigger(data, stat) {
	for (let p = 0; p < data.params.length; p++) {
		var params = data.params[p];
		if (CheckParams(params, stat))
			return true;
	}
	return false;
}