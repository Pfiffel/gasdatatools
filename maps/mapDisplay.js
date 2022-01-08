var tableOutput = document.getElementById("tableOutput");
var datatypes = ["map","lair","monster","gunbullet","object","item"]; // for utilGAS to load files, calls parseData once completed
loadGasData();
var errorLogs = document.createElement('div');
tableOutput.appendChild(errorLogs);

function LogError(text)
{
    makeDiv(text, errorLogs);
}
function parseIDs() // make super duper recursive id checker?
{

}


function makeCompactMonsterTable()
{
    var tbl = document.createElement('table');
    let th = tbl.insertRow();
	makeHeaderCell("Tier", th);
	makeHeaderCell("Monster", th);
	makeHeaderCell("HP", th);
    makeHeaderCell("speed", th);
    makeHeaderCell("pause", th);
    makeHeaderCell("1st compound cd", th);
	var totalWeight = 0;
    var sortedMonsters = gasData["monster"];
	sortedMonsters.sort((a, b) => monsterSort(a, b));
	for (let i = 0; i < sortedMonsters.length; i++)
	{
        var monsterData = sortedMonsters[i];
        if(monsterSkip[monsterData.name] == true) continue;
        var monster = new Monster(monsterData);
        var dM = document.createElement('div');
        let tr = tbl.insertRow();
        makeCell(monster.getTier(), tr);
        makeCell(monster.data.name, tr);
        makeCell(monster.data.hp, tr);
        makeCell(monster.data.runSpeed, tr);
        makeCell(monster.data.pauseBetweenMovements, tr);
        let firstCompound = "";
        if(monster.data.weapons.length == 1 && monster.data.weapons[0].params.tag == "CompoundParams")
        {
            firstCompound = monster.data.weapons[0].cooldown;
        }
        makeCell(firstCompound, tr);
	}
    return tbl;
}
function parseData()
{
	let divList = document.createElement('div');
	//divList.classList.add("inline");
	var h1List = document.createElement("h1");
	h1List.textContent = "Enemy List";
	divList.appendChild(h1List);
	var sortedMonsters = gasData["monster"];
	sortedMonsters.sort((a, b) => monsterSort(a, b));
	for (let i = 0; i < sortedMonsters.length; i++)
	{
		var monsterData = sortedMonsters[i];
		if(monsterSkip[monsterData.name] == true) continue;
        //if(!monsterData.name.includes("Xenofrog") || monsterData.name.includes("Nest")) continue;
		var monster = new Monster(monsterData);
        let monsterDiv = document.createElement('div');
        monsterDiv.classList.add("monsterBlock");
        monsterDiv.appendChild(monster.output(false));
		divList.appendChild(monsterDiv);
		//linebreak = document.createElement("br");
		//divList.appendChild(linebreak);
        
	}
	divList.appendChild(makeCompactMonsterTable());
	let divMaps = document.createElement('div');
	divMaps.classList.add("inline");
	var h1Maps = document.createElement("h1");
	h1Maps.textContent = "Maps";
	divMaps.appendChild(h1Maps);
	for (let i = 0; i < gasData["map"].length; i++)
	{
		var map = gasData["map"][i];
		if(map.name != "Quagmire") continue;
		var mapSize = Math.pow(map.mapRadius*2,2);
		var h2 = document.createElement("h2");
		h2.textContent = map.name + " (" + mil(mapSize) + " total size)";
		divMaps.appendChild(h2);
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
		for (let r = 0; r < map.regions.length; r++)
		{
			var region = map.regions[r];
			if(regionSizes[region.regionType] == undefined) regionSizes[region.regionType] = 0;
			regionSizes[region.regionType] += getPolyArea(region.poly);
		}
		for (let m = 0; m < mf.length; m++)
		{
			var monsterField = mf[m];
			
			let tr = tbl.insertRow();
			var type = monsterField.lairType;
			var fieldSize = getPolyArea(monsterField.poly);
			var lair = getLair(type);
			var info = monsterField.sectorName + "<br/>";
			info += monsterField.mapGridDesignator + "<br/><br/>";
			info += "monsterSquareSide: " + lair.monsterSquareSide + "<br/>";
			info += "Field Size: " + mil(fieldSize) + " (" + round((fieldSize/mapSize)*100,2) + "% of Map)" + "<br/>";
			var decor = monsterField.decorType;
			// TODO a bit hacky since these aren't actually guaranteed to relate, determine which regions are in which field mathematically instead
			var monsterFieldAssignedRegion = (decor == "Swamp Green") ? "Swamp" : decor;
			var wallSize = regionSizes[monsterFieldAssignedRegion];
			info += "Walls: " + mil(wallSize) + " (" + round((wallSize/fieldSize)*100,2) + "% of Field)";
			var cName = makeCell(info, tr, "name");
			cName.style.backgroundColor = numberToHex(lair.color);
			var monsterDiv = document.createElement('div');
			
			/*var densityDiv = document.createElement('div');
			densityDiv.classList.add("inline");
			densityDiv.innerHTML += "monsterSquareSide: " + lair.monsterSquareSide;
			densityDiv.innerHTML += "<br/>Field Size: " + mil(fieldSize) + " (" + round((fieldSize/mapSize)*100,2) + "%)";
			densityDiv.innerHTML += "<br/>Avg Monster Amount: " + round(monsterAmount, 2);*/
			
			var monsterAmount = fieldSize / Math.pow(lair.monsterSquareSide, 2);
			var mTable = monsterTable(lair.monsters, monsterAmount);
			mTable.classList.add("inline");
			monsterDiv.appendChild(mTable);
			//monsterDiv.appendChild(densityDiv);
			wrapInCell(monsterDiv, tr);
			if(lair.convoyBosses.length) convoysPerMinute += 1/(lair.convoyPeriodSeconds/60);
			wrapInCell(convoyBossesTable(lair), tr);
			
		}
		convoyHeader.innerHTML += " (" + round(convoysPerMinute*60,2) + "/h total)";
		divMaps.appendChild(tbl);
	}
	tableOutput.appendChild(divMaps);
	tableOutput.appendChild(divList);
}
function mil(value)
{
	return round(value/1000000,2) + "mil";
}
function getPolyArea(poly)
{
	var sum1 = 0, sum2 = 0;
	for (let p = 0; p < poly.length; p++)
	{
		sum1 += poly[p].x*poly[(p+1)%poly.length].y;
		sum2 += poly[p].y*poly[(p+1)%poly.length].x;
	}
	return Math.abs(sum1-sum2)/2;
}
function wrapInCell(content, container){
	var cell = container.insertCell();
	cell.appendChild(content);
	return cell;
}
function monsterTable(monsters, amount){
	let tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("count", th);
	makeHeaderCell("monster", th);
	makeHeaderCell("Avg Amount (" + round(amount,2) + " total)", th);
	var totalWeight = 0;
    
	for (let i = 0; i < monsters.length; i++)
	{
        totalWeight += monsters[i].count;
	}
	for (let i = 0; i < monsters.length; i++)
	{
		var m = monsters[i];
		var percentage = m.count/totalWeight;
		var monster = getMonster(m.name);
        if(monster == undefined)
        {
            LogError("Can't find monster <code><b>"+m.name+"</b></code> used in zone");
            continue;
        }
		let tr = tbl.insertRow();
		makeCell(m.count + "<br/>(" + round(percentage*100,2) + "%)", tr);
		makeCellE(monster.output(true, SCALE_SMALL), tr);
		var minions = monster.getMinions();
		var divMinion = document.createElement('div');
		var totalAmount = percentage*amount;
		addLine(round(totalAmount,2), divMinion);
        var totalMaxSpawns = 0;
        var totalMaxHP = 0;
		for (let j = 0; j < minions.length; j++)
		{
            totalMaxSpawns += minions[j].maxCount;
            totalMaxHP += minions[j].hp*minions[j].maxCount;
            var max = "<b>" + minions[j].maxCount + "x</b> " + getPluralUnitOnly(minions[j].maxCount, "spawn");
            var policy = minions[j].playerPolicy != undefined ? " - <b>" + PLAYER_PLOCIES[minions[j].playerPolicy][1] + "</b> players" : "";
            var radius = minions[j].radius != undefined ? "- <b>" + minions[j].radius + "</b> radius" : "";
            if(radius != "" && policy != "") addLine(max + radius + policy, divMinion);
			//addLine("+" + round(totalAmount*minions[j].maxCount,2) + " (max total minions)", divMinion);
			var minion = getMonster(minions[j].monsterName);
			divMinion.appendChild(minion.output(true, SCALE_SMALL));
		}
        if(totalMaxSpawns) addLine("<b>" + totalMaxSpawns + "x</b> total max " + getPluralUnitOnly(totalMaxSpawns, "spawn"), divMinion);
        if(totalMaxHP) addLine("<span class=\"hull\"><b>" + totalMaxHP + "</b> total max hp</b>", divMinion);
		makeCellE(divMinion, tr);
	}
	return tbl;
}
function convoyBossesTable(lair){
	let div = document.createElement('div');
	var cd = lair.convoyPeriodSeconds/60;
	if(lair.convoyBosses.length) div.innerHTML += "Convoy every " + round(cd, 2) + " minutes (" + round((1/cd)*60,2) + "/h)<br/><br/>";
	for (let i = 0; i < lair.convoyBosses.length; i++)
	{
		div.innerHTML += getMonster(lair.convoyBosses[i]).printBasic() + "<br/>";
	}
	return div;
}
