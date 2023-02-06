var tableOutput = document.getElementById("tableOutput");
var datatypes = ["animation","champion","decor","map","lair","monster","gunbullet","object","item","particle","region"]; // for utilGAS to load files, calls parseData once completed
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
var aAllObjects = {};
function MakeList()
{
	var divList = document.createElement("div");
	
	for (let i = 0; i < gasData["object"].length; i++)
	{
		var object = gasData["object"][i];
		aAllObjects[object.name] = 0;
	}
	for (let i = 0; i < gasData["gunbullet"].length; i++)
	{
		var bullet = gasData["gunbullet"][i];
		CountObject(bullet, bullet.objectType);
	}
	for (let i = 0; i < gasData["gunbullet"].length; i++)
	{
		var bullet = gasData["gunbullet"][i];
		CountObject(bullet, bullet.objectType);
	}
	for (let i = 0; i < gasData["particle"].length; i++)
	{
		var particle = gasData["particle"][i];
		CountObject(particle, particle.objectType);
	}
	for (let i = 0; i < gasData["champion"].length; i++)
	{
		var champion = gasData["champion"][i];
		CountObject(champion, champion.objectType);
		for (let i = 0; i < champion.guns.length; i++)
		{
			var gun = champion.guns[i];
			if(gun.objectType != "") CountObject(champion, gun.objectType);
		}
		for (let i = 0; i < champion.triggers.length; i++)
		{
			var trigger = champion.triggers[i];
			for (let j = 0; j < trigger.params.length; j++)
			{
				var param = trigger.params[j];
				if(param.data.objectType != undefined) CountObject(champion, param.data.objectType);
			}
		}
	}
	for (let i = 0; i < gasData["decor"].length; i++)
	{
		var decor = gasData["decor"][i];
		for (let i = 0; i < decor.objects.length; i++)
		{
			var object = decor.objects[i];
			if(object.objectType != "") CountObject(champion, object.objectType);
		}
	}
	for (let i = 0; i < gasData["region"].length; i++)
	{
		var region = gasData["region"][i];
		for (let i = 0; i < region.polyDecorations.length; i++)
		{
			var polyDecoration = region.polyDecorations[i];
			if(polyDecoration.objectType != "") CountObject(champion, polyDecoration.objectType);
			//segmentObjects
		}
	}
	for (let i = 0; i < gasData["monster"].length; i++)
	{
		var monsterData = gasData["monster"][i];
		if(monsterSkip[monsterData.name] == true) continue;
		var monster = new Monster(monsterData);
		CountObject(monster.data, monster.data.objectType);
		CheckAnimation(monster.data, monster.data, "idleAnimation");
		CheckAnimation(monster.data, monster.data, "runAnimation");
		for (let i = 0; i < monster.data.weapons.length; i++)
		{
			var weapon = monster.data.weapons[i];
			if(weapon.params.data.gunBulletType != undefined) CheckBullet(monster.data, weapon.params.data, "gunBulletType");
			if(weapon.params.data.monsterName != undefined) CheckMonster(monster.data, weapon.params.data, "monsterName");
			if(weapon.objectType != "") CountObject(monster.data, weapon.objectType);
			if(weapon.params.data.objectType != undefined && weapon.params.data.objectType != "") CountObject(monster.data, weapon.params.data.objectType);
			// TODO Compound
		}
	}
	for (let object in aAllObjects){
		var amount = aAllObjects[object];
		if(amount == 0) MakeError("object <b>" + object + "</b> not used!");
	}
	return divList;
}
function CountObject(root, name)
{
	if(aAllObjects[name] == undefined)
	MakeError(root.name + ": objectType <b>" + name + "</b> not found!");
else
	aAllObjects[name]++;
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
function CheckMonster(root, data, tag)
{
	var monster = getMonster(data[tag]);
	if(monster == null) MakeError(root.name + ": " + tag + " <b>" + data[tag] + "</b> not found!");
}
function MakeError(text)
{
	let div = document.createElement('div');
	div.innerHTML = text;
	tableOutput.appendChild(div);
}
