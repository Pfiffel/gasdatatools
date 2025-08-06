var tableOutput = document.getElementById("tableOutput");
var datatypes = ["map", "lair", "monster", "gunbullet", "object", "item", "soundpack", "explosion", "itempack", "globals"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");
var sortedMonsters;

var showBullets = makeInputCheckbox("Show Bullet List", RefreshLists, filters, false);
var showOnlyGFX = makeInputCheckbox("Show Graphics Only", RefreshLists, filters, false);
var drawRadiusCB = makeInputCheckbox("Show Collision Radius", RefreshLists, filters, false);
var drawShieldsCB = makeInputCheckbox("Show Shields", RefreshLists, filters, true);
var tableMode = makeInputCheckbox("Table Mode Override", RefreshLists, filters, false);
//var showSoundsCB = makeInputCheckbox("Show Sounds", RefreshLists, filters, true);
var showSoundsCB = {}; showSoundsCB.checked = false;

const FILTER_NAME = "Name";
makeInputRadios(FILTER_NAME, ["All", "Iron", "Royal", "Xenofrog", "Xenofrog Nest", "Bogweed", "Duneclaw", "Duneclaw Nest", "Dunespike", "Training"], RefreshLists, filters);
const FILTER_SUCCESSOR = "Successor";
makeInputRadios(FILTER_SUCCESSOR, ["Any", "Has Successor", "Has no Successor"], RefreshLists, filters);
const FILTER_BOSS = "Boss";
makeInputRadios(FILTER_BOSS, ["Any", "Is Boss", "Is not Boss"], RefreshLists, filters);
var dropsLoot = makeInputCheckbox("Drops Specific Loot", RefreshLists, filters, false);

function RefreshLists() {
	tableOutput.innerHTML = "";
	tableOutput.appendChild(MakeMonsterList());
	//tableOutput.appendChild(MakeCompactMonsterTable());
}

function parseData() {
	SetTierColorsFromGlobals();
	sortedMonsters = gasData["monster"];
	sortedMonsters.sort((a, b) => monsterSort(a, b));
	var totalAmount = 0;
	for (let i = 0; i < sortedMonsters.length; i++) {
		totalAmount++;
	}
	var h1List = document.createElement("h1");
	h1List.textContent = "Enemy List" + " (" + totalAmount + " total)";
	header.appendChild(h1List);
	RefreshLists();
}
function FilterCheck(name)
{
	var selName = document.querySelector('input[name="' + FILTER_NAME + '"]:checked').value;
	nameFound = name.includes(selName);
	if (selName == "Xenofrog") nameFound = nameFound & !name.includes("Nest");
	if (selName == "Xenofrog Nest") nameFound = name.includes("Xenofrog") & name.includes("Nest");
	if (selName == "Duneclaw") nameFound = nameFound & !name.includes("Nest");
	if (selName == "Duneclaw Nest") nameFound = name.includes("Duneclaw") & name.includes("Nest");
	if (selName != "All" && !nameFound) return false;
	else return true;
}
function MakeMonsterList() {
	var divList = document.createElement("div");
	let tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Monster", th);
	makeHeaderCell("Tier", th);
	makeHeaderCell("HP", th);
	makeHeaderCell("Heal", th);
	makeHeaderCell("Armor", th);
	makeHeaderCell("XP", th);
	makeHeaderCell("Spd", th);
	makeHeaderCell("Radius", th);

	if(showBullets.checked)
		for (let i = 0; i < gasData["gunbullet"].length; i++) {
			var bullet = gasData["gunbullet"][i];
			if (SkipCheck(bullet)) continue;
			if (!FilterCheck(bullet.name)) continue;
			let attackDiv = document.createElement('div');
			let spriteDiv = document.createElement('div');
			spriteDiv.classList.add("inline");
			spriteDiv.appendChild(draw(bullet));
			let infoDiv = document.createElement('div');
			infoDiv.classList.add("inline");
			infoDiv.innerHTML = bullet.name + " " +
				bullet.damage + " damage " +
				bullet.speed + " speed " +
				convertPowersToString(bullet.powers);
			attackDiv.appendChild(spriteDiv);
			attackDiv.appendChild(infoDiv);
			divList.appendChild(attackDiv);
		}

	for (let i = 0; i < sortedMonsters.length; i++) {
		var monsterData = sortedMonsters[i];
		if (SkipCheck(monsterData)) continue;
		if (!FilterCheck(monsterData.name)) continue;

		var monster = new Monster(monsterData);

		var selBoss = document.querySelector('input[name="' + FILTER_BOSS + '"]:checked').value;
		var filterBoss = (monster.data.boss && (selBoss == "Is Boss")) || (!monster.data.boss && (selBoss == "Is not Boss"));
		if (selBoss != "Any" && !filterBoss) continue;

		var selSucc = document.querySelector('input[name="' + FILTER_SUCCESSOR + '"]:checked').value;
		var filterSucc = ((monster.data.successorMonster != "") && (selSucc == "Has Successor")) || ((monster.data.successorMonster == "") && (selSucc == "Has no Successor"));
		if (selSucc != "Any" && !filterSucc) continue;

		filterLoot = ((monster.data.itemPackDrops != undefined && monster.data.itemPackDrops.length != 0) && dropsLoot.checked) || !dropsLoot.checked;
		if (!filterLoot) continue;

		let monsterDiv = document.createElement('div');
		monsterDiv.classList.add("monsterBlock");
		if(showOnlyGFX.checked)
			monsterDiv.appendChild(monster.outputGFX(false, SCALE_STANDARD, drawRadiusCB.checked, drawShieldsCB.checked, showSoundsCB.checked));
		else
			monsterDiv.appendChild(monster.output(false, SCALE_STANDARD, drawRadiusCB.checked, drawShieldsCB.checked, showSoundsCB.checked));
		divList.appendChild(monsterDiv);
		monster.MakeTableRow(tbl);
	}
	if(tableMode.checked)
		return tbl;
	else
		return divList;
}
function MakeCompactMonsterTable() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("tier", th);
	makeHeaderCell("name", th);
	makeHeaderCell("hp", th);
	//makeHeaderCell("drops", th);
	//makeHeaderCell("healRate", th);
	makeHeaderCell("speed", th);
	makeHeaderCell("pause", th);
	makeHeaderCell("1st compound cd", th);
	var totalWeight = 0;
	for (let i = 0; i < sortedMonsters.length; i++) {
		var monsterData = sortedMonsters[i];

		if (monsterSkip[monsterData.name] == true) continue;
		if (!monsterData.name.includes("Bogweed")) continue;

		var monster = new Monster(monsterData);
		var dM = document.createElement('div');
		let tr = tbl.insertRow();
		makeCell(monster.getTier(), tr);
		makeCell(monster.data.name, tr);
		makeCell(monster.data.hp, tr);
		//makeCell(monster.data.drops, tr);
		//makeCell(monster.data.healRate, tr);
		makeCell(monster.data.runSpeed, tr);
		makeCleanCell(monster.data.pauseBetweenMovements, tr);
		let firstCompound = "";
		if (monster.data.weapons.length == 1 && monster.data.weapons[0].params.tag == "CompoundParams") {
			firstCompound = monster.data.weapons[0].cooldown;
		}
		makeCell(firstCompound, tr);
	}
	return tbl;
}
