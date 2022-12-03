var tableOutput = document.getElementById("tableOutput");
var datatypes = ["map","lair","monster","gunbullet","object","item"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");
var sortedMonsters;

var drawRadius = makeInputCheckbox("Show Collision Radius", RefreshLists, filters, false);
var drawShields = makeInputCheckbox("Show Shields", RefreshLists, filters, true);
const FILTER_NAME = "Name";
makeInputRadios(FILTER_NAME, ["All","Iron","Royal","Xenofrog","Nest","Bogweed","Training"], RefreshLists, filters);
const FILTER_SUCCESSOR = "Successor";
makeInputRadios(FILTER_SUCCESSOR, ["Any","Has Successor","Has no Successor"], RefreshLists, filters);
const FILTER_BOSS = "Boss";
makeInputRadios(FILTER_BOSS, ["Any","Is Boss","Is not Boss"], RefreshLists, filters);
var dropsLoot = makeInputCheckbox("Drops Specific Loot", RefreshLists, filters, false);

function RefreshLists()
{
	tableOutput.innerHTML = "";
	tableOutput.appendChild(MakeMonsterList());
	//tableOutput.appendChild(MakeCompactMonsterTable());
}

function parseData()
{
	sortedMonsters = gasData["monster"];
	sortedMonsters.sort((a, b) => monsterSort(a, b));
	var totalAmount = 0;
	for (let i = 0; i < sortedMonsters.length; i++)
	{
		var monsterData = sortedMonsters[i];
		if(monsterSkip[monsterData.name] == true) continue;
		totalAmount++;
	}
	var h1List = document.createElement("h1");
	h1List.textContent = "Enemy List" + " (" + totalAmount + " total)";
	header.appendChild(h1List);
	RefreshLists();
}
function MakeMonsterList()
{
	var divList = document.createElement("div");
	for (let i = 0; i < sortedMonsters.length; i++)
	{
		var monsterData = sortedMonsters[i];
		if(monsterSkip[monsterData.name] == true) continue;
		var selName = document.querySelector('input[name="'+FILTER_NAME+'"]:checked').value;
		var nameFound = selName == "Xenofrog" ? monsterData.name.includes(selName) & !monsterData.name.includes("Nest") : monsterData.name.includes(selName);
		if(selName != "All" && !nameFound) continue;

		var monster = new Monster(monsterData);

		var selBoss = document.querySelector('input[name="'+FILTER_BOSS+'"]:checked').value;
		var filterBoss = (monster.data.boss && (selBoss == "Is Boss")) || (!monster.data.boss && (selBoss == "Is not Boss"));
		if(selBoss != "Any" && !filterBoss) continue;

		var selSucc = document.querySelector('input[name="'+FILTER_SUCCESSOR+'"]:checked').value;
		var filterSucc = ((monster.data.successorMonster != "") && (selSucc == "Has Successor")) || ((monster.data.successorMonster == "") && (selSucc == "Has no Successor"));
		if(selSucc != "Any" && !filterSucc) continue;

		filterLoot = ((monster.data.drops != undefined && monster.data.drops.length != 0) && dropsLoot.checked) || !dropsLoot.checked;
		if(!filterLoot) continue;

		let monsterDiv = document.createElement('div');
		monsterDiv.classList.add("monsterBlock");
		monsterDiv.appendChild(monster.output(false, SCALE_STANDARD, drawRadius.checked, drawShields.checked));
		divList.appendChild(monsterDiv);
	}
	return divList;
}
function MakeCompactMonsterTable()
{
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
	for (let i = 0; i < sortedMonsters.length; i++)
	{
		var monsterData = sortedMonsters[i];
		
		if(monsterSkip[monsterData.name] == true) continue;
		if(!monsterData.name.includes("Bogweed")) continue;

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
		if(monster.data.weapons.length == 1 && monster.data.weapons[0].params.tag == "CompoundParams")
		{
			firstCompound = monster.data.weapons[0].cooldown;
		}
		makeCell(firstCompound, tr);
	}
    return tbl;
}
