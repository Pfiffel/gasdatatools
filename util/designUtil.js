var tableOutput = document.getElementById("tableOutput");
var datatypes = ["animation","champion","decor","map","lair","monster","gunbullet","object","item","particle","region","explosion","soundpack","emitter"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

var header = document.getElementById("header");
var filters = document.getElementById("filters");
var sortedMonsters;
var soundList = {};
soundList["champion"] = {};
soundList["monster"] = {};
soundList["gunbullet"] = {};

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
		soundList["gunbullet"][bullet.name+" (Bullet)"] = {};
		soundList["gunbullet"][bullet.name+" (Bullet)"]["Bullet Shoot"] = getSoundFromPack(bullet.soundPack);
	}
	for (let i = 0; i < gasData["particle"].length; i++)
	{
		var particle = gasData["particle"][i];
		CountObject(particle, particle.objectType);
	}
	for (let i = 0; i < gasData["champion"].length; i++)
	{
		var champion = gasData["champion"][i];
		soundList["champion"][champion.name] = {};
		CountObject(champion, champion.objectType);
		for (let i = 0; i < champion.guns.length; i++)
		{
			var gun = champion.guns[i];
			if(gun.objectType != "") CountObject(champion, gun.objectType);
			var sp = getSoundPack(gun.soundPack);
			soundList["champion"][champion.name]["Gun" +(i+1)] = sp.name + " (" + sp.sounds.length + " files)";
		}
		for (let i = 0; i < champion.triggers.length; i++)
		{
			var trigger = champion.triggers[i];
			//if(param.tag == "SharkletTrigger"){
				soundList["champion"][champion.name]["Trigger"+(i+1) + " " + trigger.name + ": " + "Sound"] = trigger.sound;
			//}
			for (let j = 0; j < trigger.params.length; j++)
			{
				var param = trigger.params[j];
				if(param.data.objectType != undefined) CountObject(champion, param.data.objectType);

				if(param.data.explosionType != undefined && param.data.explosionType != ""){
					soundList["champion"][champion.name]["Trigger"+(i+1) + " " + trigger.name + ": " + j + " Explosion"] = getExplosionSound(param.data.explosionType);
				}
				if(param.data.emitterType != undefined && param.data.emitterType != ""){
					AddEmitterSoundList("champion", champion.name, "Trigger"+(i+1) + " " + trigger.name + ": ", param.tag, param.data.emitterType);
				}
				if(param.tag == "LeapTrigger" && param.data.collisionSettings.explosion != ""){
					soundList["champion"][champion.name]["Trigger"+(i+1) + " " + trigger.name + ": " + j + " Explosion"] = getExplosionSound(param.data.collisionSettings.explosion);
				}
				if(param.data.sound != undefined){
					soundList["champion"][champion.name]["Trigger"+(i+1) + " " + trigger.name + ": " + j + " Sound "] = param.data.sound;
				}
			}
		}
		AddEmitterSoundList("champion", champion.name, "", "Forward", champion.forwardThrustEmitter);
		AddEmitterSoundList("champion", champion.name, "", "Reverse", champion.reverseThrustEmitter);
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
		soundList["monster"][monsterData.name] = {};
		soundList["monster"][monsterData.name]["Death"] = getSoundFromPack(monsterData.deathCrySoundPack);// == "Enemy Hits" ? "empty" : monsterData.deathCrySoundPack;
		var index = 0;
		for (let i = 0; i < monster.data.weapons.length; i++)
		{
			var weapon = monster.data.weapons[i];
			CheckWeapon(monster, weapon, false, index);
			index++;
			if(weapon.params.tag == "CompoundParams")
			{
				for (let j = 0; j < weapon.params.data.weapons.length; j++)
				{
					var compoundWeapon = weapon.params.data.weapons[j];
					CheckWeapon(monster, compoundWeapon, true, index);
					index++;
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
	makeHeaderCell("Entity Type", th);
	makeHeaderCell("Sound Origin", th);
	makeHeaderCell("Sound Type", th);
	makeHeaderCell("Using", th);
	for (let entityType in soundList){
		if(entityType != "champion") continue;
		var soundRoots = soundList[entityType];
		for (let soundRoot in soundRoots){
			if(soundRoot.includes("Dagger")) continue;
			if(soundRoot.includes("Murder Hornet")) continue;
			if(soundRoot.includes("Soundtesttank")) continue;
			if(soundRoot.includes("Testank")) continue;
			if(soundRoot.includes("Wasptest")) continue;
			var soundTypes = soundRoots[soundRoot];
			//if(!soundRoot.includes("Xenofrog")) continue;
			//if(!soundRoot.includes("Royal")) continue;
			//if(/[2-9]/.test(soundRoot)) continue;
			for (let tag in soundTypes){
				var sound = soundTypes[tag];
				let tr = tbl.insertRow();
				makeCell(entityType, tr);
				makeCell(soundRoot, tr);
				makeCell(tag, tr);
				makeCell(sound, tr);
			}
		}
	}
	tableOutput.appendChild(tbl);
	return divList;
}
function CheckWeapon(monster, weapon, compound, index)
{
	var wD = compound ? weapon.data : weapon.params.data;
	var tag = compound ? weapon.tag : weapon.params.tag;
	if(wD.gunBulletType != undefined) CheckBullet(monster.data, wD, "gunBulletType");
	if(wD.monsterName != undefined) CheckMonster(monster.data, wD, "monsterName");
	if(weapon.objectType != undefined && weapon.objectType != "") CountObject(monster.data, weapon.objectType);
	if(wD.objectType != undefined && wD.objectType != "") CountObject(monster.data, wD.objectType);
	var add = index + " ";
	if(tag == "ShotgunParams")
	{
		soundList["monster"][monster.data.name][add + "Shotgun Trigger"] = wD.triggerSound;
		soundList["monster"][monster.data.name][add + "Shotgun Explosion"] = getExplosionSound(wD.explosionType);// == "" ? "empty" : data.explosionType;
	}
	if(tag == "MortarParams" || tag == "MortarBarrageParams")
	{
		soundList["monster"][monster.data.name][add + "Mortar Shoot"] = wD.shootSound;
		soundList["monster"][monster.data.name][add + "Mortar Explosion"] = getExplosionSound(wD.explosionType);
	}
	if(tag == "FlamethrowerParams")
	{
		soundList["monster"][monster.data.name][add + "Flamethrower Trigger"] = wD.telegraphSound;
		soundList["monster"][monster.data.name][add + "Flamethrower Start"] = wD.startSound;
		soundList["monster"][monster.data.name][add + "Flamethrower Loop"] = wD.loopSound;
		soundList["monster"][monster.data.name][add + "Flamethrower End"] = wD.endSound;
	}
	if(tag == "MinelayerParams")
	{
		/*if(wD.emitterType != "")
		{
			var emitter = getEmitter(wD.emitterType);
			soundList["monster"][monster.data.name][add + "Mine Start"] = emitter.startSound;
			soundList["monster"][monster.data.name][add + "Mine Loop"] = emitter.loopSound;
			soundList["monster"][monster.data.name][add + "Mine End"] = emitter.endSound;
		}*/
		AddEmitterSoundList("monster", monster.data.name, add, "Mine", wD.emitterType);
		soundList["monster"][monster.data.name][add + "Mine Explosion"] = getExplosionSound(wD.explosionType);
	}
}
function AddEmitterSoundList(entityType, entity, add, prefix, emitterType)
{
	if(emitterType != "")
	{
		var emitter = getEmitter(emitterType);
		soundList[entityType][entity][add + prefix + " Start"] = emitter.startSound;
		soundList[entityType][entity][add + prefix + " Loop"] = emitter.loopSound;
		soundList[entityType][entity][add + prefix + " End"] = emitter.endSound;
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
