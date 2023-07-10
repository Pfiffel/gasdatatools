var gunColors = ["#AAAAAA","#DDAADD","#DDDDAA","#AADDDD"];
var header = document.getElementById("header");
var options = document.getElementById("options");
var tableOutput = document.getElementById("tableOutput");
var GUN_SCALE = 0.2;
var miniDPSTable = {};
var miniProgressionTable = {};
var skip = {"Testank":true,"Testank2":true,"Duality":true};
const CHECKBOX_ACCOLADES = "Show Accolades";
const NOTES_DPS = {
	"Mustang":"Does not consider passive",
	"Wasp":"Assumes you always hit all Trigger 1 projectiles",
	"Mako":"Does not consider Trigger 2 cooldown and energy resets\nDoes not consider extra output during Trigger 4 debuff"
};
const NOTES_GUN_DPS = {
	"Hercules":"Does not consider passive",
	"Peacemaker":"Does not consider passive",
	"Warthog":"Does not consider passive",
	"Wasp":"Does not consider passive",
	"Yeti":"Does not consider passive"
};
var datatypes = ["champion","object","accolade"]; // for utilGAS to load files, calls parseData once completed
loadGasData();
function Refresh()
{
	let tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Name", th);
	makeHeaderCell("Blurb", th);
	makeHeaderCell("Hull & Repair", th);
	makeHeaderCell("Equipment", th);
	makeHeaderCell("Radius", th);
	makeHeaderCell("Movement", th);
	
	makeHeaderCell("Guns <i>(graphic is scaled down to " + percToString(GUN_SCALE) + ")</i>", th);
	makeHeaderCell("Passive", th);
	makeHeaderCell("Triggers <i>(DPS based on " + MANA_PER_SECOND + " mps)</i>", th);
	makeHeaderCell("Shields", th);
	for (let i = 0; i < gasData.champion.length; i++)
	{
		var player = gasData.champion[i];
		if(player.choosable != 1 || skip[player.name] == true) continue;
		let tr = tbl.insertRow();
		var nameCell = makeCell(player.name + "<br/><br/>", tr, "name");

		nameCell.appendChild(draw(player, 0.4));
		//nameCell.appendChild(document.createTextNode(player.blurb));
		makeCell(player.blurb, tr);
		makeHullCell(tr.insertCell(), player);
		makeEquipmentCell(tr.insertCell(), player);

		var size = round(Math.PI*(player.radius*player.radius), 2);
		var sizeCell = makeCell(player.radius, tr);
		sizeCell.appendChild(drawHitbox(player.radius));
		sizeCell.appendChild(document.createTextNode(size));
		sizeCell.appendChild(document.createElement("br"));
		sizeCell.appendChild(document.createTextNode("area size"));
		makeMoveCell(tr.insertCell(), player);
		makeGunCell(tr.insertCell(), player);
		var pretendItem = {};
		pretendItem.name = player.passiveName;
		pretendItem.effects = player.passives;
		makeCellE(MakeStatsTable(pretendItem, 0), tr);
		//makePassiveCell(tr.insertCell(), player);
		makeTriggerCell(tr.insertCell(), player);
		makeShieldCell(tr.insertCell(), player);
		if(document.getElementById(CHECKBOX_ACCOLADES).checked)
		{
			let tr2 = tbl.insertRow();
			let accCell = tr2.insertCell();
			accCell.colSpan = 10;
			accCell.style.width = "10px"; // hack to make it not stretch past the actual table width
			makeAccoladeCell(accCell, player);
		}
	}
	tableOutput.innerHTML = "";
	tableOutput.appendChild(tbl);
	makeMiniDPSTable(tableOutput);
	makeMiniProgressionTable(tableOutput);
}
function parseData()
{
	header.innerHTML = "<h1>Player Tanks</h1>";
	makeInputCheckbox(CHECKBOX_ACCOLADES, Refresh, options, true);
	Refresh();
}
function makeAccoladeCell(container, player)
{
	var accHeader = document.createElement('div');
	container.appendChild(accHeader);
	var accolades = GetAccolades(player.name);
	for (let i in accolades)
	{
		var accolade = accolades[i];
		var divTable = document.createElement('div');
		divTable.classList.add("inline");
		divTable.appendChild(MakeStatsTable(accolade, 0));
		container.appendChild(divTable);
	}
	var totalCost = CalculateAccoladeCost(accolades.length);
	accHeader.innerHTML = "<b>" + player.name + " Accolade Bonuses" + "</b> (" + accolades.length + " total, " + totalCost + " total Accolade cost: " + totalCost*100 + " boss kills & " + totalCost*350 + " Glory)";
	if(miniProgressionTable[player.name] == undefined) miniProgressionTable[player.name] = {};
	miniProgressionTable[player.name].bonuses = accolades.length;
	miniProgressionTable[player.name].accolades = totalCost;
}
function CalculateAccoladeCost(amount)
{
	const SAME_COST = 3;
	var currentCost = 0;
	var totalCost = 0;
	for (let i = 0; i < amount; i++)
	{
		var mod = i % SAME_COST;
		if(mod == 0) currentCost++;
		totalCost += currentCost;
	}
	return totalCost;
}
function MakeAccoladeRow(container, accolade)
{
	let tr = container.insertRow();
	makeCell(accolade.displayName, tr);
	makeCellE(MakeStatsTable(accolade, 0), tr)
}
function MakeAccoladeCell(container, accolade)
{
	let tr = container.insertRow();
	makeCell(accolade.displayName, tr);
	makeCellE(MakeStatsTable(accolade, 0), tr)
}
function makeMiniDPSTable(container)
{
	tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Tank", th);
	makeHeaderCell("Gun DPS", th);
	makeHeaderCell("Trigger DPS", th);
	makeHeaderCell("Total DPS", th);
	for (let tank in miniDPSTable)
	{
		var data = miniDPSTable[tank];
		let tr = tbl.insertRow();
		makeCell(tank, tr, "name");
		makeCell(round(data.gunDPS,2), tr);
		makeCell(round(data.trigDPS,2), tr);
		makeCell(round(data.gunDPS+data.trigDPS,2), tr);
	}
	var div = document.createElement('div');
	div.innerHTML += "DPS Summary";
	container.appendChild(div);
	container.appendChild(tbl);
}
function makeMiniProgressionTable(container)
{
	tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Tank", th);
	makeHeaderCell("Slot Unlocks", th);
	makeHeaderCell("Accolade Bonuses", th);
	makeHeaderCell("Medals Cost", th);
	makeHeaderCell("Accolades Cost", th);
	makeHeaderCell("Medals Glory", th);
	makeHeaderCell("Accolades Glory", th);
	makeHeaderCell("Total Glory", th);
	makeHeaderCell("Minimum Boss Kills", th);
	for (let tank in miniProgressionTable)
	{
		var data = miniProgressionTable[tank];
		let tr = tbl.insertRow();
		makeCell(tank, tr, "name");
		makeCell(data.slots, tr);
		makeCell(data.bonuses, tr);
		makeCell(data.medals, tr);
		makeCell(data.accolades, tr);
		var medals = (data.medals-1)*(data.medals+4)/2*5;
		makeCell(medals, tr);
		makeCell(data.accolades*350, tr);
		makeCell(medals+data.accolades*350, tr);
		makeCell(Math.ceil(medals/6)+data.accolades*100, tr);
	}
	var div = document.createElement('div');
	div.innerHTML += "Progression Summary";
	container.appendChild(div);
	container.appendChild(tbl);
}
function makeMoveCell(container, player)
{
	var moveTable = document.createElement('table');
	statRowPlayer(moveTable, player, "acceleration");
	statRowPlayer(moveTable, player, "angularAccel");
	statRowPlayer(moveTable, player, "rotationDecay");
	statRowPlayer(moveTable, player, "speedLimit");
	container.appendChild(moveTable);
}
function makeHullCell(container, player)
{
	var moveTable = document.createElement('table');
	statRowPlayer(moveTable, player, "hp", "hull");
	statRowPlayer(moveTable, player, "healRate", "hull");
	var tilFull = round(player.hp/player.healRate, 2);
	statRow(moveTable, "until full", tilFull + "s");
	container.appendChild(moveTable);
}
function makeEquipmentCell(container, player)
{
	var eqTable = document.createElement('table');
	let thE = eqTable.insertRow();
	makeHeaderCell("Type", thE);
	makeHeaderCell("Start", thE);
	makeHeaderCell("Max", thE);
	makeHeaderCell("Medals", thE);
	var totalMedals = 0;
	var totalUnlocks = 0;
	for (let i = 0; i < player.slotLimits.length; i++)
	{
		var type = player.slotLimits[i];
		let trE = eqTable.insertRow();
		makeCell(SLOT_TYPES[i][0], trE);
		makeCell(type.minSlots, trE);
		makeCell(type.maxSlots, trE);
		var unlocks = type.maxSlots - type.minSlots;
		totalUnlocks += unlocks;
		var totalCost = (unlocks*(unlocks+1))/2;
		totalMedals += totalCost;
		makeCell(totalCost, trE);
	}
	container.appendChild(eqTable);
	container.innerHTML += "Total Medals: <b>" + totalMedals + "</b>";
	if(miniProgressionTable[player.name] == undefined) miniProgressionTable[player.name] = {};
	miniProgressionTable[player.name].slots = totalUnlocks;
	miniProgressionTable[player.name].medals = totalMedals;
}
function makeGunCell(container, player)
{
	var divTable = document.createElement('div');
	divTable.classList.add("inline");
	var divDraw = document.createElement('div');
	divDraw.classList.add("inline");
	var gunTable = document.createElement('table');
	let thG = gunTable.insertRow();
	makeHeaderCell("Gun", thG);
	makeHeaderCell("Damage", thG);
	makeHeaderCell("Cooldown", thG);
	makeHeaderCell("Range", thG);
	makeHeaderCell("Speed", thG);
	makeHeaderCell("DPS", thG);
	var totalDPS = 0;
	var totalShotsPerSecond = 0;
	var gunDrawData = [];
	for (let g = 0; g < player.guns.length; g++)
	{
		var gun = player.guns[g];
		let trG = gunTable.insertRow();
		makeCell(g+1, trG);
		makeCell(gun.damage, trG);
		makeCell(gun.cooldown, trG);
		var rangeCell = makeCell(gun.range, trG);
		rangeCell.style.color = gunColors[g];
		makeCell(gun.speed, trG);
		var newGunData = {};
		newGunData.radius = gun.range*GUN_SCALE;
		newGunData.halfArc = gun.halfArc;
		newGunData.radians = degToRad(gun.halfArc/10);
		gunDrawData.push(newGunData);
		let shotsPerSecond = (1000/gun.cooldown);
		var dps = shotsPerSecond*gun.damage;
		totalDPS += dps;
		totalShotsPerSecond += shotsPerSecond;
		makeCell(round(dps, 2), trG);
	}
	var addAsterisk = NOTES_GUN_DPS[player.name] != undefined;
	if(addAsterisk) divTable.title = NOTES_GUN_DPS[player.name];
	divTable.appendChild(gunTable);
	divTable.innerHTML += "Total DPS: <b>" + round(totalDPS, 2) + (addAsterisk ? "*" : "") + "</b>";
	divTable.innerHTML += "<br/>Total shots per second: <b>" + round(totalShotsPerSecond, 2) + "</b>";
	if(miniDPSTable[player.name] == undefined) miniDPSTable[player.name] = {};
	miniDPSTable[player.name].gunDPS = totalDPS;
	//divTable.innerHTML += "<br/><i>graphic is scaled down to " + percToString(GUN_SCALE) + "</i>";
	divDraw.appendChild(drawGunHitboxes(gunDrawData));
	container.appendChild(divTable);
	container.appendChild(divDraw);
}

function makeTriggerCell(container, player)
{
	var triggerTable = document.createElement('table');
	//triggerTable.classList.add("inline");
	let thT = triggerTable.insertRow();
	makeHeaderCell("Trig", thT);
	makeHeaderCell("Cost", thT);
	makeHeaderCell("Cooldown", thT);
	makeHeaderCell("Damage", thT);
	makeHeaderCell("DPM", thT);
	makeHeaderCell("DPS", thT);
	makeHeaderCell("Name", thT);
	//makeHeaderCell("Description", thT);
	
	var tempData = [{},{},{},{}];
	for (let t = 0; t < player.triggers.length; t++)
	{
		var trigger = player.triggers[t];
		let trT = triggerTable.insertRow();
		makeCell(t+1, trT);
		makeCell(trigger.mana, trT, "energy");
		makeCell(msToSeconds(trigger.cooldown), trT);
		var damage = 0;
		for (let p = 0; p < trigger.params.length; p++)
		{
			var params = trigger.params[p];
			if(params.tag == "ShotgunTrigger") damage += params.data.damage*(params.data.mirror+1);
			if(params.tag == "LeapTrigger") damage += params.data.collisionSettings.damage;
			if(params.tag == "SharkletTrigger") damage += params.data.count * params.data.damage;
			// TODO make this more correcterer for when a trigger has BOTH FireRateBoostTrigger and DamageBoostTrigger
			if(params.tag == "FireRateBoostTrigger")
			{
				let totalBonusDPS = 0;
				for (let g = 0; g < player.guns.length; g++)
				{
					let gun = player.guns[g];
					let bonusRoF = 1+(params.data.amount/100);
					let dpsGun = (1000/gun.cooldown)*gun.damage;
					let dpsGunNew = bonusRoF*(1000/gun.cooldown)*gun.damage;
					totalBonusDPS += dpsGunNew-dpsGun;
				}
				damage += totalBonusDPS*(params.data.duration/1000);
			}
			if(params.tag == "DamageBoostTrigger") 
			{
				let totalBonusDPS = 0;
				for (let g = 0; g < player.guns.length; g++)
				{
					let gun = player.guns[g];
					let dpsGun = (1000/gun.cooldown)*gun.damage;
					let dpsGunNew = (1000/gun.cooldown)*(gun.damage+params.data.extraDamagePerShot);
					totalBonusDPS += dpsGunNew-dpsGun;
				}
				damage += totalBonusDPS*(params.data.duration/1000);
			}
			// TODO make this more correcterer for when a trigger has BOTH GUN_FIRE_RATE and DAMAGE boost
			if(params.tag == "StatBoostTrigger") 
			{
				let totalBonusDPS = 0;
				for (let g = 0; g < player.guns.length; g++)
				{
					let bonusRoF = 1; let bonusDmG = 1;
					if(STAT_TYPES[params.data.statType][0] == "GUN_FIRE_RATE") bonusRoF = 1+(params.data.amount/100);
					else if(STAT_TYPES[params.data.statType][0] == "DAMAGE") bonusDmG = 1+(params.data.amount/100);
					let gun = player.guns[g];
					let dpsGun = (1000/gun.cooldown)*gun.damage;
					let dpsGunNew = bonusRoF*(1000/gun.cooldown)*(gun.damage*bonusDmG);
					totalBonusDPS += dpsGunNew-dpsGun;
				}
				damage += totalBonusDPS*(params.data.duration/1000);
			}
			if(params.data.statusEffects != undefined)
			{
				for (let e = 0; e < params.data.statusEffects.length; e++)
				{
					var effect = params.data.statusEffects[e];
					if(effect.tag == "BurningEffect") damage += effect.data.dps*effect.data.duration/1000;
				}
			}
		}
		var dpm = damage/trigger.mana;
		var dps = damage/Math.max((trigger.cooldown/1000),(trigger.mana/MANA_PER_SECOND));
		tempData[t].damage = damage;
		tempData[t].cooldown = trigger.cooldown/1000;
		tempData[t].mana = trigger.mana;
		tempData[t].dpm = dpm;
		tempData[t].index = t+1;
		makeCell(damage != 0 ? round(damage, 2) : "", trT);
		makeCell(damage != 0 ? round(dpm, 2) : "", trT);
		makeCell(damage != 0 ? round(dps, 2) : "", trT);
		makeCell(trigger.name, trT);
		//makeCell(trigger.description, trT);
	}
	var totalDPS = 0;
	var pool = MANA_PER_SECOND;
	var dpsInfo = "";
	// sort by damage per mana to prioritize "efficient" triggers for maximum dps output
	tempData.sort((a, b) => (b.dpm > a.dpm) ? 1 : -1)

	for (let t = 0; t < tempData.length; t++)
	{
		if(tempData[t].damage == 0) continue;
		var poolCost = tempData[t].mana/tempData[t].cooldown;
		if(poolCost >= pool)
		{
			var dpsRest = (tempData[t].damage/tempData[t].mana)*pool;
			dpsInfo += "Trigger " + tempData[t].index + ": " + round(dpsRest, 2) + "<br/>";
			totalDPS += dpsRest;
			break;
		}
		else
		{
			var dpsCurrent = tempData[t].damage/tempData[t].cooldown;
			pool -= poolCost;
			dpsInfo += "Trigger " + tempData[t].index + ": " + round(dpsCurrent, 2) + "<br/>";
			totalDPS += dpsCurrent;
		}
	}
	var addAsterisk = NOTES_DPS[player.name] != undefined;
	var divDPSInfo = document.createElement('div');
	if(addAsterisk) divDPSInfo.title = NOTES_DPS[player.name];
	//divDPSInfo.classList.add("inline");
	divDPSInfo.innerHTML += dpsInfo;
	divDPSInfo.innerHTML += "Maximum DPS: <b>" + round(totalDPS, 2) + (addAsterisk ? "*" : "") + "</b>";
	miniDPSTable[player.name].trigDPS = totalDPS;
	container.appendChild(triggerTable);
	container.appendChild(divDPSInfo);
}
function makeShieldCell(container, player)
{
	var divTable = document.createElement('div');
	divTable.classList.add("inline");
	var divDraw = document.createElement('div');
	divDraw.classList.add("inline");
	var shieldTable = document.createElement('table');
	let thS = shieldTable.insertRow();
	makeHeaderCell("Shield", thS);
	makeHeaderCell("Strength", thS);
	makeHeaderCell("Level", thS);
	makeHeaderCell("Arc", thS);
	var strengthPerLevel = [];
	var shieldDrawData = [];
	for (let s = 0; s < player.shields.length; s++)
	{
		var shield = player.shields[s];
		let trS = shieldTable.insertRow();
		var shieldCell = makeCell(s+1, trS);
		shieldCell.style.color = numberToHex(shield.color);
		makeCell(shield.maxStrength, trS);
		makeCell(shield.level, trS);
		makeCell(GetArcShield(shield), trS);
		strengthPerLevel[shield.level] = shield.maxStrength;
		var newShieldData = {};
		newShieldData.strength = shield.maxStrength;
		newShieldData.left = shield.left;
		newShieldData.right = shield.right;
		newShieldData.level = shield.level;
		newShieldData.color = numberToHex(shield.color);
		shieldDrawData.push(newShieldData);
	}
	var totalStrength = 0;
	for (let s = 0; s < strengthPerLevel.length; s++)
	{
		totalStrength += strengthPerLevel[s];
	}
	divTable.appendChild(shieldTable);
	divTable.innerHTML += "<br/>Max layer strength: <b>" + round(totalStrength, 2) + "</b>";
	//divTable.innerHTML += "<br/><i>graphic is scaled down to " + percToString(GUN_SCALE) + "</i>";
	divDraw.appendChild(drawShields(shieldDrawData, strengthPerLevel));
	container.appendChild(divTable);
	container.appendChild(divDraw);
}
function statRowPlayer(container, player, stat, cssclass)
{
	let tr = container.insertRow();
	makeCell(stat, tr);
	makeCell(player[stat], tr, cssclass);
}
function statRow(container, stat, value, cssclass)
{
	let tr = container.insertRow();
	makeCell(stat, tr);
	makeCell(value, tr);
}
function msToSeconds(ms)
{
	return (ms/1000)+"s";
}
function drawHitbox(radius)
{
	var canvas = document.createElement('canvas');
	canvas.width = 50;
	canvas.height = 50;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d'); 
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#AAAAAA';
		ctx.stroke();
	}
	return canvas;
}
function drawGunHitboxes(gunDrawData)
{
	var canvas = document.createElement('canvas');
	canvas.width = 800 * GUN_SCALE + 2;
	canvas.height = 800 * GUN_SCALE + 2;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d'); 
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		for (let g = 0; g < gunDrawData.length; g++)
		{
			var gun = gunDrawData[g];
			ctx.beginPath();
			if(gun.halfArc != 1800) ctx.moveTo(x, y);
			ctx.arc(x, y, gun.radius, -gun.radians-0.5*Math.PI, gun.radians-0.5*Math.PI, false);
			if(gun.halfArc != 1800) ctx.lineTo(x, y);
			ctx.lineWidth = 1;
			ctx.strokeStyle = gunColors[g];
			ctx.stroke();
			ctx.closePath();
		}
	}
	return canvas;
}
function drawShields(shieldDrawData, strengthPerLevel)
{
	var canvas = document.createElement('canvas');
	canvas.width = 162;
	canvas.height = 162;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d'); 
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		for (let g = 0; g < shieldDrawData.length; g++)
		{
			var shield = shieldDrawData[g];
			ctx.beginPath();
			strength = strengthPerLevel[shield.level]/SHIELD_STRENGTH_PER_RADIUS;
			//ctx.moveTo(x, y);
			var offset = 40 + (strengthPerLevel[0]/SHIELD_STRENGTH_PER_RADIUS+2.5) * shield.level;
			var makeGap = (shield.left == -1800 && shield.right == 1800) ? 0 : degToRad(1);
			var left = degToRad(shield.left/10) - 0.5 * Math.PI + makeGap;
			var right = degToRad(shield.right/10) - 0.5 * Math.PI - makeGap;
			ctx.arc(x, y, offset, left, right, false);
			ctx.arc(x, y, offset + shield.strength/SHIELD_STRENGTH_PER_RADIUS, right, left, true);
			ctx.arc(x, y, offset, left, left, false);
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = shield.color;
			ctx.fill();
			//ctx.lineWidth = 1;
			//ctx.strokeStyle = "#DDDDDD";
			//ctx.stroke();
			ctx.closePath();
		}
	}
	return canvas;
}
