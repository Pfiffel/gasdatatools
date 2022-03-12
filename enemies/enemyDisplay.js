var tableOutput = document.getElementById("tableOutput");
var datatypes = ["map","lair","monster","gunbullet","object","item"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

function parseData()
{
	let divList = document.createElement('div');
	var h1List = document.createElement("h1");
	divList.appendChild(h1List);
	var sortedMonsters = gasData["monster"];
	sortedMonsters.sort((a, b) => monsterSort(a, b));
	var totalAmount = 0;
	for (let i = 0; i < sortedMonsters.length; i++)
	{
		var monsterData = sortedMonsters[i];
		if(monsterSkip[monsterData.name] == true) continue;
		totalAmount++;;
		var monster = new Monster(monsterData);
		let monsterDiv = document.createElement('div');
		monsterDiv.classList.add("monsterBlock");
		monsterDiv.appendChild(monster.output(false));
		divList.appendChild(monsterDiv);
	}
	divList.appendChild(makeCompactMonsterTable());
	h1List.textContent = "Enemy List" + " (" + totalAmount + " total)";
	tableOutput.appendChild(divList);
}

function makeCompactMonsterTable()
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
