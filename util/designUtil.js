var tableOutput = document.getElementById("tableOutput");
var datatypes = ["animation","map","lair","monster","gunbullet","object","item"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");
var sortedMonsters;

function RefreshLists()
{
	tableOutput.innerHTML = "";
	tableOutput.appendChild(MakeList());
}
function parseData()
{
	RefreshLists();
}
function MakeList()
{
	var divList = document.createElement("div");

	for (let i = 0; i < gasData["monster"].length; i++)
	{
		var monsterData = gasData["monster"][i];
		if(monsterSkip[monsterData.name] == true) continue;
		var monster = new Monster(monsterData);
		CheckAnimation(monster.data, monster.data, "idleAnimation");
		CheckAnimation(monster.data, monster.data, "runAnimation");
		for (let i = 0; i < monster.data.weapons.length; i++)
		{
			var weapon = monster.data.weapons[i];
			if(weapon.params.data.gunBulletType != undefined) CheckBullet(monster.data, weapon.params.data, "gunBulletType");
			// TODO Compound
		}
	}
	return divList;
}
function CheckAnimation(root, data, tag)
{
	if(data[tag] != "")
	{
		var anim = getAnimation(data[tag]);
		if(anim == null) MakeError(data.name + ": " + tag + " <b>" + data[tag] + "</b> not found!");
	}
}
function CheckBullet(root, data, tag)
{
	var bullet = getBullet(data[tag]);
	if(bullet == null) MakeError(root.name + ": " + tag + " <b>" + data[tag] + "</b> not found!");
}
function MakeError(text)
{
	let div = document.createElement('div');
	div.innerHTML = text;
	tableOutput.appendChild(div);
}
