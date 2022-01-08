const SCALE_STANDARD = 0.5;
const SCALE_SMALL = 0.25;
const monsterSkip = {"Iron Justiciar":true, "Test Event Boss 2":true, "Test Event Boss":true, "Test Event Minion":true};

const TIER_COLORS = ["","#FF7777","#77CC77","#9999FF","#77DDDD","#FFFF77","#EB98CB","#F5A849","#C162F5","#FFFFFF","#FFFFFF"];
const TIER_NAMES = ["","Alpha","Beta","Gamma","Delta","Epsilon","Omega","","","","Precursor Tech"];
const MAX_LEVEL = 20;
const SHIELD_STRENGTH_PER_RADIUS = 20;
const MANA_PER_SECOND = 2.5;
const STAT_TYPES = {
	"0": ["DAMAGE", "Gun Damage"],
	"1": ["HEAL_RATE", "Repair Rate"],
	"2": ["MANA_RATE", "Energy Production"],
	"3": ["HEALTH", "Hull Strength"],
	"4": ["MANA", "Energy"],
	"5": ["GUN_FIRE_RATE", "Gun Rate of Fire"],
	"6": ["TRIGGER_FIRE_RATE", "Trigger Rate of Fire"],
	"7": ["SHIELD_RATE", "Shield Recovery Rate"],
	"8": ["GUN_RANGE", "Gun Range"],
	"9": ["SHIELD_STRENGTH", "Shield Strengh"],
	"10": ["RADIUS", "Hull Radius"],
	"11": ["TRIGGER_COST", "Trigger Energy Cost"],
	"12": ["ULT_FIRE_RATE", "Trigger 4 Rate of Fire"]
};
const ACTIVE_WHILE_NAMES = {
	"0": ["ALWAYS", "always"],
	"1": ["HEALTH_FULL", "undamaged"],
	"2": ["HEALTH_BELOW_100", "damaged"],
	"3": ["HEALTH_BELOW_50", "hull below 50%"],
	"4": ["MANA_FULL", "energy full"],
	"5": ["MANA_ABOVE_75", "energy above 50%"],
	"6": ["MANA_BELOW_75", "energy below 75%"],
	"7": ["MANA_BELOW_50", "energy below 50%"],
	"8": ["SCOOTING", "scooting"],
	"9": ["NOT_MOVING", "not moving"],
	"10": ["ULT_ON_COOLDOWN", "trigger 4 on cooldown"],
	"11": ["ULT_NOT_ON_COOLDOWN", "trigger 4 not on cooldown"],
	"12": ["NOTHING_EQUIPPED", "nothing equipped"],
	"13": ["THRUSTING", "thrusters engaged"],
	"14": ["NOT_THRUSTING", "thrusters not engaged"],
	"15": ["THRUSTING_FORWARD", "forward thrusters engaged"],
	"16": ["THRUSTING_BACKWARD", "reverse thrusters engaged"],
	"17": ["SHIELDS_FULL", "all shields full"]
};
const TRIGGERED_TRIGGER_EFFECTS = {
	"0": ["TRIGGER1234", "any trigger"],
	"1": ["TRIGGER1", "trigger 1"],
	"2": ["TRIGGER234", "trigger 2, 3 or 4"],
	"3": ["TRIGGER34", "trigger 3 or 4"],
	"4": ["TRIGGER4", "trigger 4"],
	"5": ["TRIGGER12", "trigger 1 or 2"],
	"6": ["SCOOT", "scoot"],
	"7": ["TRIGGER2", "trigger 2"],
	"8": ["TRIGGER3", "trigger 3"],
	"9": ["TRIGGER23", "trigger 2 or 3"],
	"10": ["TRIGGER123", "trigger 1, 2 or 3"],
};
const PLAYER_PLOCIES = {
	"0": ["IGNORE", "Ignore"],
	"1": ["APPROACH", "Approach"],
};

// Helpers
function GetArc(data)
{
	var arc = -(data.left-data.right)/10;
	if(arc < 0) arc += 360;
	return arc+"°";
}
function GetStat(i, j)
{
	//return [0,0];
	try{ return STAT_TYPES[i][j]; }
	catch(e) {console.log("stat " + i + " not found");}
	return ["UNKNOWN", "UNKNOWN", 0, {}];
}
function monsterSort(a, b)
{
	if(a.boss) return 1;
	if(b.boss) return -1; 
	if(getTier(a.xp) > getTier(b.xp))
		return 1;
	else
		return -1;
}
function getTier(xp){
	return parseInt(Math.sqrt(xp));
}
function isSymbioteDropper(monster)
{
	var givesXP = Boolean(monster.xp);
	var hasGlobalDrops = !Boolean(monster.drops.length) && givesXP;
	var t = getTier(monster.xp) - 2;
	return(t > 0 && t <= 6) && hasGlobalDrops;
}
// ITEMS and SYMBS

function MakeStatsTable(mainData, tier)
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell(colorWrap(mainData.name, TIER_COLORS[tier]), th);
	if(mainData.description != undefined && mainData.description != "")
	{
		let tr = tbl.insertRow();
		makeCell(mainData.description, tr);
	}
	let prevCondition = undefined;
	let prevCell;
	let prevRepeat = false;
	for (var effect in mainData.effects){
		let data = mainData.effects[effect].data;
		let tr = tbl.insertRow();
		let mainTag = mainData.effects[effect].tag;
		s = "";
		if(mainTag == "ItemStat" || mainTag == "ItemShield")
		{
			var activeWhile = data.activeWhile;
			if(activeWhile != undefined && activeWhile != 0) 
			{
				if(prevCondition != undefined && prevCondition == activeWhile) prevRepeat = true; else prevRepeat = false;
				if(!prevRepeat) s += "While " + classWrap(ACTIVE_WHILE_NAMES[activeWhile][1], "cKeyValue") + ":<br/>";
				prevCondition = activeWhile;
				if(ACTIVE_WHILE_NAMES[activeWhile][2] == undefined) ACTIVE_WHILE_NAMES[activeWhile][2] = 0;
				ACTIVE_WHILE_NAMES[activeWhile][2]++;
				if(ACTIVE_WHILE_NAMES[activeWhile][3] == undefined) ACTIVE_WHILE_NAMES[activeWhile][3] = {};
				ACTIVE_WHILE_NAMES[activeWhile][3][mainData.name] = 1;
			}
			if(mainTag == "ItemStat")
			{
				var amount = data.amount;
				var statType = data.statType;
				s += classWrap(amountToString(amount), "cKeyValue") + GetStat(statType, 1) + "<br/>";
				if(STAT_TYPES[statType][2] == undefined) STAT_TYPES[statType][2] = 0;
				STAT_TYPES[statType][2]++;
				if(STAT_TYPES[statType][3] == undefined) STAT_TYPES[statType][3] = {};
				STAT_TYPES[statType][3][mainData.name] = 1;
			}
			else if(mainTag == "ItemShield")
			{
				var hex = numberToHex(data.shield.color);
				s += printKeyAndData("Shield", "Strength " + data.shield.maxStrength);
				s += printKeyAndData("Shield", colorWrap("Arc "+GetArc(data.shield), hex));
			}
		}
		else if(mainTag == "TriggeredTriggerEffect" || mainTag == "TriggeredHealMineBurst")
		{
			if(prevCondition != undefined && prevCondition == data.when) prevRepeat = true; else prevRepeat = false;
			if(!prevRepeat) s += "On " + classWrap(TRIGGERED_TRIGGER_EFFECTS[data.when][1], "cKeyValue") + ":<br/>";
			prevCondition = data.when;
			if(mainTag == "TriggeredTriggerEffect")
			{
				var params = data.params;
				if(params.tag == "FireRateBoostTrigger"){
					s += printKeyAndData("Rate of Fire Boost", params.data.amount + "%");
					s += printKeyAndData("Duration", params.data.duration);
				}
				if(params.tag == "ShotgunTrigger"){
					s += printKeyAndData("AoE Damage", params.data.damage);
					s += printKeyAndData("Range", params.data.range);
					s += printKeyAndData("Arc", (params.data.halfArc * 0.2) + "°");
				}
				if(params.tag == "HealOverTimeTrigger"){
					s += printKeyAndData("Heal Amount", params.data.amount + (params.data.asPercentage == 1 ? "%" : ""), params.data.applyToMana == 1 ? "energy" : "heal");
					s += printKeyAndData("Duration", params.data.duration);
				}
				if(params.tag == "ShieldRefillTrigger"){
					s += printKeyAndData("Shield Refill", params.data.refillPercentage + "%");
				}
				if(params.tag == "HealTrigger"){
					s += printKeyAndData("Repair Amount", params.data.healAmount + (params.data.asPercentage == 1 ? "%" : ""), params.data.applyToMana == 1 ? "energy" : "heal");
				}
				if(params.tag == "StatBoostTrigger"){
					s += printKeyAndData(GetStat(params.data.statType, 1), params.data.amount + "%");
					s += printKeyAndData("Duration", params.data.duration);
				}
				if(params.tag == "DematerializeTrigger"){
					if(params.data.percentChance != undefined && params.data.percentChance != 1)
						s += printKeyAndData("Dematerialize Chance", params.data.percentChance + "%");
					s += printKeyAndData("Dematerialize Duration", params.data.duration);
				}
				if(params.tag == "ExtraGunTrigger"){
					let dps = round(1000*params.data.stats.damage/params.data.stats.cooldown,2);
					s += printKeyAndData("Gun", dps + " DPS");
					s += printKeyAndData("Duration", params.data.duration);
				}
				if(params.tag == "ExtraShieldTrigger"){
					var hex = numberToHex(params.data.stats.color);
					s += printKeyAndData("Shield", "Strength " + params.data.stats.maxStrength);
					s += printKeyAndData("Shield", colorWrap("Arc "+GetArc(params.data.stats), hex));
				}
				if(params.tag == "GunProcTrigger"){
					s += "For <b>" + params.data.duration + "</b> ms, gun shots apply:" + "<br/>";
					s += ShowStatusEffect(params.data.statusEffect);
				}
			}
			else if(mainTag == "TriggeredHealMineBurst")
			{
				s += "Create <b>" + data.mineCount + "</b> repair packs" + "<br/>";
				s += printKeyAndData("Repair Amount", data.healing, "heal");
				s += printKeyAndData("Duration", data.duration);
			}
		}
		else if(mainTag == "RandomTargetEffect" || mainTag == "TriggeredRandomTargetEffect")
		{
			if(data.when != undefined)
			{
				if(prevCondition != undefined && prevCondition == data.when) prevRepeat = true; else prevRepeat = false;
				if(!prevRepeat) s += "On " + classWrap(TRIGGERED_TRIGGER_EFFECTS[data.when][1], "cKeyValue") + ":<br/>";
				prevCondition = data.when;
				s += "Targets nearby enemies with these effects:<br/>";
			}
			else
				s += "Periodically targets enemies with these effects:<br/>";
			if(data.cooldown != undefined) s += printKeyAndData("Cooldown", data.cooldown);
			s += printKeyAndData("Range", data.range);
			for (var effects in data.statusEffects){
				var effect = data.statusEffects[effects];
				s += ShowStatusEffect(effect);
			}
		}
		else
		{
			s += "<u>"+mainTag+"</u>";
			s += "<br/>";
			var iterEffect = mainData.effects[effect];
			for (var key in iterEffect.data){
				if(key == "statusEffects") continue;
				if(key == "emitterType" || key == "explosionType" || key == "objectType") continue;
				if(key == "shield"){
					for (var shieldKey in iterEffect.data[key]){
						s += printKeyAndData(shieldKey, iterEffect.data[key][shieldKey]);
					}
					continue;
				}
				s += printKeyAndData(key, iterEffect.data[key]);
			}
		}
		if(prevRepeat)
			prevCell.innerHTML += s;
		else
			prevCell = makeCell(s, tr);
	}
	return tbl;
}
function ShowStatusEffect(effect)
{
	var s = "";
	if(effect.tag == "FreezeEffect") s += printKeyAndData("Freeze Duration", effect.data.duration);
	if(effect.tag == "StunEffect") s += printKeyAndData("Stun Duration", effect.data.duration);
	if(effect.tag == "DoTEffect") s += printKeyAndData("DoT Total", effect.data.dps*effect.data.duration/1000);
	if(effect.tag == "DamageEffect") s += printKeyAndData("Damage", effect.data.damage);
	if(effect.tag == "BlastEffect") {s += printKeyAndData("AoE Damage", effect.data.damage);s += printKeyAndData("Radius", effect.data.radius);}
	return s;
}
function showUsage(data)
{
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("index", th);
	makeHeaderCell("ID", th);
	makeHeaderCell("tool tip", th);
	makeHeaderCell("usage total", th);
	makeHeaderCell("usage unique", th);
	makeHeaderCell("usage by", th);
	for (let key in data)
	{
		let tr = tbl.insertRow();
		makeCell(key, tr);
		makeCell(data[key][0], tr);
		makeCell(data[key][1], tr);
		var usage = data[key][2];
		makeCell(usage != undefined ? usage : "", tr);
		var list = data[key][3];
		var sList = "";
		var uniqueUsage = 0;
		for (let entity in list)
		{
			uniqueUsage++;
			sList += entity + ", ";
		}
		makeCell(uniqueUsage != 0 ? uniqueUsage : "", tr);
		makeCell(sList.substring(0, sList.length - 2), tr);
	}
	return tbl;
}
function printKeyAndData(key, data, cssClass){
	cssClass = cssClass === undefined ? "" : cssClass;
	var addText = classWrap(key, "cKey") + ": " + classWrap(data, cssClass == "" ? "cKeyValue" : cssClass);
	if(key == "color")
	{
		var hex = numberToHex(data);
		addText += " (" + colorWrap(hex, hex) + ")";
	}
	addText += "<br/>";
	return addText;
}
// Loading Stuff
var gasData = {};
var gasDataF = {};
var datatypesF = undefined;
var additionalFileLoaded = true;
function loadGasData()
{
	for (let i = 0; i < datatypes.length; i++)
	{
		loadJsonFile("../json/" + datatypes[i] + ".json", function(loadedData){
			gasData[datatypes[i]] = JSON.parse(loadedData);
			if(allLoaded()) parseData();
		});
	}
    if(datatypesF != undefined)
    for (let i = 0; i < datatypesF.length; i++)
	{
		loadJsonFile("../jsonfactory/" + datatypesF[i] + ".json", function(loadedDataF){
			gasDataF[datatypesF[i]] = JSON.parse(loadedDataF);
			if(allLoaded()) parseData();
		});
	}
}
function allLoaded(){
	return dataLoaded() && dataFLoaded() && additionalFileLoaded;
}
function dataLoaded(){
	for (let i = 0; i < datatypes.length; i++)
	{
		if(gasData[datatypes[i]] == undefined) return false;
	}
	return true;
}
function dataFLoaded(){
    if(datatypesF == undefined) return true;
	for (let i = 0; i < datatypesF.length; i++)
	{
        console.log(gasDataF[datatypesF[i]]);
		if(gasDataF[datatypesF[i]] == undefined) return false;
	}
	return true;
}
// TODO make objects with name key list instead of all this iteration?
function getLair(type){
	for (let i = 0; i < gasData["lair"].length; i++)
	{
		var lair = gasData["lair"][i];
		if(type == lair.name) return lair;
	}
}
function getMonster(type){
	for (let i = 0; i < gasData["monster"].length; i++)
	{
		var monster = gasData["monster"][i];
		if(type == monster.name) return new Monster(monster);
	}
}
function getBullet(type){
	for (let i = 0; i < gasData["gunbullet"].length; i++)
	{
		var bullet = gasData["gunbullet"][i];
		if(type == bullet.name) return bullet;
	}
}
function getObject(type){
	for (let i = 0; i < gasData["object"].length; i++)
	{
		var object = gasData["object"][i];
		if(type == object.name) return object;
	}
}
function getItem(type){
	for (let i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(type == item.name) return item;
	}
}
function GetRegion(type){
	for (let i = 0; i < gasData["region"].length; i++)
	{
		var region = gasData["region"][i];
		if(type == region.name) return region;
	}
}
function GetLane(type){
	for (let i = 0; i < gasData["lane"].length; i++)
	{
		var lane = gasData["lane"][i];
		if(type == lane.name) return lane;
	}
}
// Drawing Stuff
function getMaxFromShapes(object, x, y, max)
{
	for (let i = 0; i < object.shapes.length; i++)
	{
		var shape = object.shapes[i];
		for (let j = 0; j < shape.points.length; j++)
		{
			var point = shape.points[j];
			max[0] = Math.min(point.x+x, max[0]);
			max[1] = Math.min(point.y+y, max[1]);
			max[2] = Math.max(point.x+x, max[2]);
			max[3] = Math.max(point.y+y, max[3]);
			if(shape.mirror) max[1] = Math.min(-point.y+y, max[1]);
			if(shape.mirror) max[3] = Math.max(-point.y+y, max[3]);
		}
	}
	return max;
}
function getObjectResolution(object, weapons){
	var max = [0,0,0,0];
	max = this.getMaxFromShapes(object, 0, 0, max);

	if(weapons != undefined)
	for (let i = 0; i < weapons.length; i++)
	{
		var turret = weapons[i].objectType;
		if(turret != "")
		{
			var offset = [0,0];
			var attach = weapons[i].attachmentPoint;
			if(attach != "") offset = this.getAttachmentPoint(object, attach);
			max = this.getMaxFromShapes(getObject(turret), offset[0], offset[1], max);
		}
	}
	return [max[2]-max[0],max[3]-max[1],-(max[0]+(max[2]-max[0])/2),-(max[1]+(max[3]-max[1])/2)];
}
function getAttachmentPoint(object, name){
	for (let i = 0; i < object.attachmentPoints.length; i++)
	{
		var point = object.attachmentPoints[i];
		if(point.name == name) return [point.pos.p.x, point.pos.p.y];
	}
}
function drawShapes(ctx, scale, x, y, object)
{
	for (let i = 0; i < object.shapes.length; i++)
	{
		var shape = object.shapes[i];
		ctx.beginPath();
		ctx.moveTo(shape.points[0].x+x, shape.points[0].y+y);
		
		for (let j = 0; j < shape.points.length; j++)
		{
			var point = shape.points[j];
			ctx.lineTo(point.x+x, point.y+y);
		}
		if(shape.mirror)
		{
			if(shape.closed)
			{
				ctx.lineTo(shape.points[0].x+x, shape.points[0].y+y);
				this.closeShape(ctx, scale, shape.color);
				ctx.beginPath();
			}
			else
				ctx.lineTo(shape.points[shape.points.length-1].x+x, -shape.points[shape.points.length-1].y+y);
			for (let j = shape.points.length-1; j >= 0; j--)
			{
				var point = shape.points[j];
				ctx.lineTo(point.x+x, -point.y+y);
			}
			if(shape.closed)
				ctx.lineTo(shape.points[shape.points.length-1].x+x, -shape.points[shape.points.length-1].y+y);
			else
				ctx.lineTo(shape.points[0].x+x, shape.points[0].y+y);
		}
		else
			ctx.lineTo(shape.points[0].x+x, shape.points[0].y+y);
		this.closeShape(ctx, scale, shape.color);
	}
}
function closeShape(ctx, scale, color){
	ctx.lineWidth = 1.5/scale;
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.fillStyle = numberToHex(color);
	ctx.fill();
	ctx.closePath();
}
function draw(data, scale = 0.4)
{
	var object = getObject(data.objectType);
	if(object == undefined) {
		console.log("Can't find " + data.objectType);
		return document.createElement('canvas');
	}
	var res = getObjectResolution(object, data.weapons);
	var canvas = document.createElement('canvas');
	canvas.title = data.name;
	canvas.width = res[0] * scale + 4;
	canvas.height = res[1] * scale + 4;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.scale(scale, scale);
		var x = canvas.width / 2 / scale + res[2];
		var y = canvas.height / 2 / scale + res[3];
		drawShapes(ctx, scale, x, y, object);
		if(data.weapons != undefined)
		for (let i = 0; i < data.weapons.length; i++)
		{
			var turret = data.weapons[i].objectType;
			if(turret != "")
			{
				var offset = [0,0];
				var attach = data.weapons[i].attachmentPoint;
				if(attach != "") offset = getAttachmentPoint(object, attach);
				drawShapes(ctx, scale, x+offset[0], y+offset[1], getObject(turret));
			}
		}
	}
	return canvas;
}