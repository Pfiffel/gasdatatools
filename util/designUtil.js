var tableOutput = document.getElementById("tableOutput");
var datatypes = ["animation","champion","decor","map","lair","monster","gunbullet","object","item","particle","region"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");
var sortedMonsters;
var soundList = {};

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
		soundList[bullet.name] = {};
		soundList[bullet.name]["Bullet Shoot"] = bullet.soundPack;
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
		soundList[monsterData.name] = {};
		soundList[monsterData.name]["Death"] = monsterData.deathCrySoundPack;// == "Enemy Hits" ? "empty" : monsterData.deathCrySoundPack;
		for (let i = 0; i < monster.data.weapons.length; i++)
		{
			var weapon = monster.data.weapons[i];
			CheckWeapon(monster, weapon, weapon.params.data);
			if(weapon.params.tag == "CompoundParams")
			{
				for (let j = 0; j < weapon.params.data.weapons.length; j++)
				{
					var compoundWeapon = weapon.params.data.weapons[j];
					CheckWeapon(monster, compoundWeapon, compoundWeapon.data);
				}
			}
		}
	}
	for (let object in aAllObjects){
		var amount = aAllObjects[object];
		//if(amount == 0) MakeError("object <b>" + object + "</b> not used!");
	}
	let tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Sound Origin", th);
	makeHeaderCell("Sound Type", th);
	makeHeaderCell("Using", th);
	for (let soundRoot in soundList){
		var soundTypes = soundList[soundRoot];
		if(!soundRoot.includes("Xenofrog")) continue;
		for (let tag in soundTypes){
			var sound = soundTypes[tag];
			let tr = tbl.insertRow();
			makeCell(soundRoot, tr);
			makeCell(tag, tr);
			makeCell(sound, tr);
		}
	}
	tableOutput.appendChild(tbl);
	return divList;
}
function CheckWeapon(monster, weapon, data)
{
	if(data.gunBulletType != undefined) CheckBullet(monster.data, data, "gunBulletType");
	if(data.monsterName != undefined) CheckMonster(monster.data, data, "monsterName");
	if(weapon.objectType != undefined && weapon.objectType != "") CountObject(monster.data, weapon.objectType);
	if(data.objectType != undefined && data.objectType != "") CountObject(monster.data, data.objectType);
	
	if(weapon.tag == "ShotgunParams")
	{
		soundList[monster.data.name]["Shotgun Trigger"] = data.triggerSound;
		soundList[monster.data.name]["Shotgun Explode"] = data.explosionType;// == "" ? "empty" : data.explosionType;
	}
	if(weapon.tag == "MortarParams" || weapon.tag == "MortarBarrageParams")
	{
		soundList[monster.data.name]["Mortar Shoot"] = data.shootSound;
		soundList[monster.data.name]["Mortar Explode"] = data.explosionType;
	}
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
