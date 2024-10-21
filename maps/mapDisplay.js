var tableOutput = document.getElementById("tableOutput");
var datatypes = ["map", "faction", "lair", "region", "lane", "monster", "gunbullet", "object", "item"]; // for utilGAS to load files, calls parseData once completed
loadGasData();
var errorLogs = document.createElement('div');
tableOutput.appendChild(errorLogs);

function LogError(text) {
	makeDiv(text, errorLogs);
}

var filters = document.getElementById("filters");
const FILTER_FACTION = "Faction";

function RefreshLists() {
	tableOutput.innerHTML = "";
	tableOutput.appendChild(MakeMonsterList());
	//tableOutput.appendChild(MakeCompactMonsterTable());
}

function parseData() {
	var factions = [];
	for (let i = 0; i < gasData["faction"].length; i++) {
		factions.push(gasData["faction"][i].name);
	}
	var head = document.createElement("h2");
	head.textContent = "Active Faction";
	header.appendChild(head);
	makeInputRadios(FILTER_FACTION, factions, RefreshLists, filters);
	RefreshLists();
}

function RefreshLists() {
	tableOutput.innerHTML = "";
	let divMaps = document.createElement('div');
	divMaps.classList.add("inline");
	var h1Maps = document.createElement("h1");
	h1Maps.textContent = "Maps";
	divMaps.appendChild(h1Maps);
	for (let i = 0; i < gasData["map"].length; i++) {
		var map = gasData["map"][i];
		if (!(map.name == "Quagmire" || map.name == "Quagmire Remix")) continue;
		var mapSize = Math.pow(map.mapRadius * 2, 2);
		var h2 = document.createElement("h2");
		h2.textContent = ((map.overworld != 1) ? "(INACTIVE) " : "") + map.name + " (" + mil(mapSize) + " total size, " + map.miniBossSpawns.length + " nest spawns)";
		divMaps.appendChild(h2);
		var drawn = DrawMap(map.name, 0.01);
		drawn.style.display = "inline";
		divMaps.appendChild(drawn);
		var h3 = document.createElement("h3");
		h3.textContent = "monsterFields";
		divMaps.appendChild(h3);
		var tbl = document.createElement('table');
		let th = tbl.insertRow();
		makeHeaderCell("Name/Designator/Info", th);
		makeHeaderCell("Monsters", th);
		var convoyHeader = makeHeaderCell("Convoy Bosses", th);
		var convoysPerMinute = 0;
		var mf = map.monsterFields;

		var regionSizes = {};
		for (let r = 0; r < map.regions.length; r++) {
			var region = map.regions[r];
			if (regionSizes[region.regionType] == undefined) regionSizes[region.regionType] = 0;
			regionSizes[region.regionType] += getPolyArea(region.poly);
		}
		for (let m = 0; m < mf.length; m++) {
			var monsterField = mf[m];

			let tr = tbl.insertRow();
			//var type = monsterField.lairType;
			var tag = monsterField.tag;
			var fieldSize = getPolyArea(monsterField.poly);
			var faction = document.querySelector('input[name="' + FILTER_FACTION + '"]:checked').value;
			var lair = getLairForFaction(faction, tag);
			var info = monsterField.sectorName + "<br/>";
			info += monsterField.mapGridDesignator + "<br/>";
			if(monsterField.zoneName != undefined && monsterField.zoneName != "") info += monsterField.zoneName + "<br/>";
			info += "<br/>";
			info += "monsterSquareSide: " + lair.monsterSquareSide + "<br/>";
			info += "Field Size: " + mil(fieldSize) + " (" + round((fieldSize / mapSize) * 100, 2) + "% of Map)" + "<br/>";
			var decor = monsterField.decorType;
			// TODO a bit hacky since these aren't actually guaranteed to relate, determine which regions are in which field mathematically instead
			var monsterFieldAssignedRegion = (decor == "Swamp Green") ? "Swamp" : decor;
			var wallSize = regionSizes[monsterFieldAssignedRegion];
			info += "Walls: " + mil(wallSize) + " (" + round((wallSize / fieldSize) * 100, 2) + "% of Field)" + "<br/>";
			var miniBossSpawns = 0;
			if (map.miniBossSpawns != undefined) for (let i = 0; i < map.miniBossSpawns.length; i++) {
				var miniBossPoint = map.miniBossSpawns[i];
				if (IsPointInsidePoly(miniBossPoint, monsterField.poly)) miniBossSpawns++;
			}
			info += "Nest spawns: " + miniBossSpawns;
			var cName = makeCell(info, tr, "name");
			cName.style.backgroundColor = numberToHex(lair.color);
			var monsterDiv = document.createElement('div');

			/*var densityDiv = document.createElement('div');
			densityDiv.classList.add("inline");
			densityDiv.innerHTML += "monsterSquareSide: " + lair.monsterSquareSide;
			densityDiv.innerHTML += "<br/>Field Size: " + mil(fieldSize) + " (" + round((fieldSize/mapSize)*100,2) + "%)";
			densityDiv.innerHTML += "<br/>Avg Monster Amount: " + round(monsterAmount, 2);*/

			var monsterAmount = fieldSize / Math.pow(lair.monsterSquareSide, 2);
			var mTable = monsterTable(lair.monsters, monsterField.localFauna, monsterAmount);
			mTable.classList.add("inline");
			monsterDiv.appendChild(mTable);
			//monsterDiv.appendChild(densityDiv);
			wrapInCell(monsterDiv, tr);
			if (lair.convoyBosses.length) convoysPerMinute += 1 / (lair.convoyPeriodSeconds / 60);
			wrapInCell(convoyBossesTable(lair), tr);

		}
		convoyHeader.innerHTML += " (" + round(convoysPerMinute * 60, 2) + "/h total)";
		divMaps.appendChild(tbl);
	}
	tableOutput.appendChild(divMaps);
}
function IsPointInsidePoly(point, vs) {
	var x = point.x, y = point.y;
	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i].x, yi = vs[i].y;
		var xj = vs[j].x, yj = vs[j].y;

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}
function mil(value) {
	return round(value / 1000000, 2) + "mil";
}
function getPolyArea(poly) {
	var sum1 = 0, sum2 = 0;
	for (let p = 0; p < poly.length; p++) {
		sum1 += poly[p].x * poly[(p + 1) % poly.length].y;
		sum2 += poly[p].y * poly[(p + 1) % poly.length].x;
	}
	return Math.abs(sum1 - sum2) / 2;
}
function wrapInCell(content, container) {
	var cell = container.insertCell();
	cell.appendChild(content);
	return cell;
}
function monsterTable(monsters, fauna, amount) {
	let tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("count", th);
	makeHeaderCell("monster", th);
	makeHeaderCell("Avg Amount (" + round(amount, 2) + " total)", th);
	var totalWeight = 0;

	for (let i = 0; i < monsters.length; i++) {
		totalWeight += monsters[i].count;
	}
	for (let i = 0; i < fauna.length; i++) {
		totalWeight += fauna[i].count;
	}
	for (let i = 0; i < monsters.length; i++) {
		var m = monsters[i];
		let tr = tbl.insertRow();
		MakeMonsterDiv(m, totalWeight, amount, tr);
	}
	for (let i = 0; i < fauna.length; i++) {
		var m = fauna[i];
		let tr = tbl.insertRow();
		MakeMonsterDiv(m, totalWeight, amount, tr);
	}
	return tbl;
}
function MakeMonsterDiv(m, totalWeight, amount, tr) {
	var percentage = m.count / totalWeight;
	var monster = getMonster(m.name);
	if (monster == undefined) {
		LogError("Can't find monster <code><b>" + m.name + "</b></code> used in zone");
		return;
	}
	makeCell(m.count + "<br/>(" + round(percentage * 100, 2) + "%)", tr);
	makeCellE(monster.output(true, SCALE_SMALL, false, false), tr);
	var minions = monster.getMinions();
	var divMinion = document.createElement('div');
	var totalAmount = percentage * amount;
	addLine(round(totalAmount, 2), divMinion);
	var totalMaxSpawns = 0;
	var totalMaxHP = 0;
	for (let j = 0; j < minions.length; j++) {
		totalMaxSpawns += minions[j].maxCount;
		totalMaxHP += minions[j].hp * minions[j].maxCount;
		var max = "<b>" + minions[j].maxCount + "x</b> " + getPluralUnitOnly(minions[j].maxCount, "spawn");
		var policy = minions[j].playerPolicy != undefined ? " - <b>" + PLAYER_POLICIES[minions[j].playerPolicy][1] + "</b> players" : "";
		var radius = minions[j].radius != undefined ? "- <b>" + minions[j].radius + "</b> radius" : "";
		if (radius != "" && policy != "") addLine(max + radius + policy, divMinion);
		//addLine("+" + round(totalAmount*minions[j].maxCount,2) + " (max total minions)", divMinion);
		var minion = getMonster(minions[j].monsterName);
		divMinion.appendChild(minion.output(true, SCALE_SMALL, false, false));
	}
	if (totalMaxSpawns) addLine("<b>" + totalMaxSpawns + "x</b> total max " + getPluralUnitOnly(totalMaxSpawns, "spawn"), divMinion);
	if (totalMaxHP) addLine("<span class=\"hull\"><b>" + totalMaxHP + "</b> total max hp</b>", divMinion);
	makeCellE(divMinion, tr);
}
function convoyBossesTable(lair) {
	let div = document.createElement('div');
	var cd = lair.convoyPeriodSeconds / 60;
	if (lair.convoyBosses.length) div.innerHTML += "Convoy every " + round(cd, 2) + " minutes (" + round((1 / cd) * 60, 2) + "/h)<br/>Difficulty: " + lair.convoyDifficulty + "<br/><br/>";
	for (let i = 0; i < lair.convoyBosses.length; i++) {
		div.innerHTML += getMonster(lair.convoyBosses[i]).printBasic(lair.convoyDifficulty / 3) + "<br/>";
	}
	return div;
}
