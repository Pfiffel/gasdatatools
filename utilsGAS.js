const SCALE_STANDARD = 0.5;
const SCALE_SMALL = 0.25;
const MAP_CANVAS_SIZE = 600;
const monsterSkip = {"Iron Justiciar":true, "Test Event Boss 2":true, "Test Event Boss":true, "Test Event Minion":true};

const TIER_COLORS = ["","#FF7777","#77CC77","#9999FF","#77DDDD","#FFFF77","#EB98CB","#F5A849","#C162F5","#FFFFFF","#8EC726"];
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
	"5": ["MANA_ABOVE_75", "energy above 75%"],
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
	"17": ["SHIELDS_FULL", "all shields full"],
	"18": ["ROTATING", "rotating"],
	"19": ["NOT_ROTATING", "not rotating"]
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
	"11": ["ON_DAMAGE", "damage taken"],
};
const PLAYER_POLICIES = {
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

function MakeStatsTable(mainData, tier, bPortrait = false, bDescription = true)
{
	if(tier == 0) tier = mainData.tier;
	var tbl = document.createElement('table');
	let th = tbl.insertRow();

	if(bPortrait)
	{
		var image = new Image();
		image.src = "https://gasgame.net/portrait/"+mainData.name+".png";
		//image.height = "64";
		var img = makeCellE(image, th);
		img.rowSpan = 10;
	}

	var name = mainData.displayName != undefined ? mainData.displayName : mainData.name;
	makeHeaderCell(colorWrap(name, TIER_COLORS[tier]), th);

	if(bDescription && mainData.description != undefined && mainData.description != "")
	{
		let tr = tbl.insertRow();
		var desc = makeCell(mainData.description, tr);
	}
	let prevCondition = undefined;
	let prevCell;
	let prevRepeat = false;
	let dps = 0;
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

			if(TRIGGERED_TRIGGER_EFFECTS[data.when][2] == undefined) TRIGGERED_TRIGGER_EFFECTS[data.when][2] = 0;
			TRIGGERED_TRIGGER_EFFECTS[data.when][2]++;
			if(TRIGGERED_TRIGGER_EFFECTS[data.when][3] == undefined) TRIGGERED_TRIGGER_EFFECTS[data.when][3] = {};
			TRIGGERED_TRIGGER_EFFECTS[data.when][3][mainData.name] = 1;
			
			if(mainTag == "TriggeredTriggerEffect")
			{
				let o = GetTriggeredEffectString(data.params.tag, data.params.data);
				s += o.s;
				//dps += o.damage;
			}
			else if(mainTag == "TriggeredHealMineBurst")
			{
				s += MakePickupPackText(data);
			}
		}
		else if(mainTag == "GunProcs")
		{
			s += classWrap(data.percentChance + "%", "cKeyValue") + " to affect gun shots:<br/>";
			s += AddEffectsText(data);
		}
		else if(mainTag == "PeriodicTriggerEffect")
		{
			var chanceTo = "";
			if(data.percentChance != undefined && data.percentChance != 100)
				chanceTo = ", " + classWrap(data.percentChance + "%", "cKeyValue") + " to";
			s += "Every " + classWrap(data.cooldown, "cKeyValue") + " ms" + chanceTo + ":<br/>";
			let cooldownAndChanceMult = (10/data.cooldown)*data.percentChance;
			for (var p in data.params){
				var effect = data.params[p];
				let o = GetTriggeredEffectString(effect.tag, effect.data);
				s += o.s;
				dps += o.damage * cooldownAndChanceMult;
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
			let cooldownMult = 1000/data.cooldown;
			s += printKeyAndData("Range", data.range);
			for (var effects in data.statusEffects){
				var effect = data.statusEffects[effects];
				let o = ShowStatusEffect(effect);
				s += o.s;
				dps += o.damage * cooldownMult;
			}
		}
		else if(mainTag == "TaggedTriggerBonus")
		{
			if(data.tooltip == "") continue;
			s += data.tooltip + "<br/>";
			s += GetBonusEffectString(data.bonus.tag, data.bonus.data);
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
		{
			prevCell = makeCell(s, tr);
			prevCell.colSpan = 2;
		}
	}
	if(dps > 0) 
	{
		var dpsCell = makeCell(printKeyAndData("DPS", round(dps,2)), tbl.insertRow());
		dpsCell.colSpan = 2;
	}
	return tbl;
}
function MakePickupPackText(data)
{
	var s = "";
	s += "Create <b>" + data.mineCount + "</b> pickup pack" + (data.mineCount != 1 ? "s" : "") + "<br/>";
	if(data.healing > 0) s += printKeyAndData("Repair Amount", data.healing, "heal");
	s += printKeyAndData("Duration", data.duration + " ms");
	if(data.powers != undefined) for(let i = 0; i < data.powers.length; i++)
	{
		let powerData = data.powers[i].data;
		let power = data.powers[i].tag;
		if(power == "StatPower")
		{
			s += printKeyAndData(GetStat(powerData.statType, 1), BonusPrefix(powerData.amount) + "%");
			s += printKeyAndData("Duration", powerData.duration + " ms");
		}
		else if(power == "ShieldRechargePower")
		{
			s += "Refill all shields <b>" + powerData.amount + "</b>" + "<br/>";
		}
		else if(power == "EnergyDamagePower")
		{
			s += "Recharge <b>" + -powerData.energyDamage + "</b> energy" + "<br/>";
		}
	}
	return s;
}
function AddEffectsText(data)
{
	var s = "";
	if(data.statusEffects != undefined) for(let i = 0; i < data.statusEffects.length; i++)
	{
		let effectData = data.statusEffects[i].data;
		let effect = data.statusEffects[i].tag;
		if(effect == "StunEffect")
		{
			s += printKeyAndData("Stun Duration", effectData.duration + " ms");
		}
		else if(effect == "RootEffect")
		{
			s += printKeyAndData("Root Duration", effectData.duration + " ms");
		}
		else if(effect == "Damage Effect")
		{
			s += printKeyAndData("Damage", effectData.damage);
		}
		else if(effect == "DoTEffect" || effect == "BurningEffect")
		{
			s += printKeyAndData("DoT DPS", effectData.dps);
			s += printKeyAndData("DoT Duration", effectData.duration + " ms");
		}
	}
	return s;
}
function GetTriggeredEffectString(tag, data)
{
	var s = ""; var damage = 0;
	if(tag == "FireRateBoostTrigger"){
		s += printKeyAndData("Rate of Fire Boost", data.amount + "%");
		s += printKeyAndData("Duration", data.duration + " ms");
	}
	else if(tag == "ShotgunTrigger"){
		
		if(data.tooltip != "") s += data.tooltip + "<br/>";
		if(data.damage > 0) s += printKeyAndData("AoE Damage", data.damage);
		s += printKeyAndData("Range", data.range);
		s += printKeyAndData("Arc", (data.halfArc * 0.2) + "°");
		s += AddEffectsText(data);
		damage += data.damage;
	}
	else if(tag == "CooldownResetTrigger"){
		s += "Reset cooldown on <b>trigger " + (data.triggerIndex+1) + "</b>" + "<br/>";
	}
	else if(tag == "HealOverTimeTrigger"){
		s += printKeyAndData("Heal Amount", data.amount + (data.asPercentage == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
		s += printKeyAndData("Duration", data.duration + " ms");
	}
	else if(tag == "PickupPackTrigger"){
		s += MakePickupPackText(data);
	}
	else if(tag == "MineTrigger")
	{
		s += printKeyAndData("AoE Damage", data.damage);
		s += printKeyAndData("Range", data.burstRadius);
		s += printKeyAndData("Duration", data.duration + " ms");
		damage += data.damage;
	}
	else if(tag == "AreaHealTrigger"){
		s += printKeyAndData("Repair Amount", data.amount, "heal");
		s += printKeyAndData("Radius", data.radius);
	}
	else if(tag == "ShieldRefillTrigger"){
		s += printKeyAndData("Shield Refill", data.refillPercentage + "%");
	}
	else if(tag == "HealTrigger"){
		s += printKeyAndData("Repair Amount", data.healAmount + (data.asPercentage == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
	}
	else if(tag == "StatBoostTrigger"){
		s += printKeyAndData(GetStat(data.statType, 1), data.amount + "%");
		s += printKeyAndData("Duration", data.duration + " ms");
	}
	else if(tag == "DematerializeTrigger"){
		if(data.percentChance != undefined && data.percentChance != 100)
			s += printKeyAndData("Dematerialize Chance", data.percentChance + "%");
		s += printKeyAndData("Dematerialize Duration", data.duration + " ms");
	}
	else if(tag == "ExtraGunTrigger"){
		let dps = round(1000*data.stats.damage/data.stats.cooldown,2);
		s += printKeyAndData("Create Gun", dps + " DPS");
		s += printKeyAndData("Duration", data.duration + " ms");
		damage += dps*(data.duration/1000);
	}
	else if(tag == "ExtraShieldTrigger"){
		var hex = numberToHex(data.stats.color);
		s += printKeyAndData("Shield", "Strength " + data.stats.maxStrength);
		s += printKeyAndData("Shield", colorWrap("Arc "+GetArc(data.stats), hex));
	}
	else if(tag == "GunProcTrigger"){
		s += "For <b>" + data.duration + "</b> ms, gun shots apply:" + "<br/>";
		let o = ShowStatusEffect(data.statusEffect);
		s += o.s;
		damage += o.damage;
	}
	else if(tag == "LeapTrigger"){
		s += printKeyAndData("Leap Distance", data.range);
	}
	else if(tag == "SharkletTrigger"){
		s += printKeyAndData("Missile Count", data.count);
		s += printKeyAndData("Damage", data.damage);
		s += printKeyAndData("Range", data.range);
		damage += data.damage * data.count;
	}
	var o = {};
	o.s = s;
	o.damage = damage;
	return o;
}
function GetBonusEffectString(tag, data)
{
	var s = "";/*
	if(tag == "FireRateBoostTrigger"){
		s += printKeyAndData("Rate of Fire Boost", data.amount + "%");
		s += printKeyAndData("Duration", data.duration);
	}*/
	if(tag == "ShotgunTriggerBonus"){
		// TODO pass in raw data value to function, handle the prefix there, pass in category (amount, time, percentage)
		if(data.damage != 0)					s += printKeyAndDataBonus("AoE Damage", BonusPrefix(data.damage));
		if(data.range != 0)						s += printKeyAndDataBonus("Range", BonusPrefix(data.range));
		if(data.halfArc != 0)					s += printKeyAndDataBonus("Arc", BonusPrefix(data.halfArc * 0.2) + "°");
		if(data.targetingDelay != 0)	s += printKeyAndDataBonus("Targeting Delay", BonusPrefix(data.targetingDelay) + " ms");
		s += AddEffectsText(data);
	}
	else if(tag == "HealOverTimeTriggerBonus"){
		if(data.amount != 0)					s += printKeyAndDataBonus("Repair Amount", BonusPrefix(data.amount));
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefix(data.duration));
	}/*
	else if(tag == "ShieldRefillTrigger"){
		s += printKeyAndData("Shield Refill", data.refillPercentage + "%");
	}*/
	else if(tag == "HealTriggerBonus"){
		if(data.healAmount != 0)			s += printKeyAndDataBonus("Repair Amount", BonusPrefix(data.healAmount) + (data.usePercentInTooltip == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
	}
	else if(tag == "StatBoostTriggerBonus"){
		if(data.amount != 0)					s += printKeyAndDataBonus((data.statType != undefined) ? GetStat(data.statType, 1) : "Boost Amount", BonusPrefix(data.amount) + "%");
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefix(data.duration) + " ms");
	}
	else if(tag == "DematerializeTriggerBonus"){
		if(data.percentChance != 0)		s += printKeyAndDataBonus("Dematerialize Chance", BonusPrefix(data.percentChance));
		if(data.duration != 0)				s += printKeyAndDataBonus("Dematerialize Duration", BonusPrefix(data.duration));
	}/*
	else if(tag == "ExtraGunTrigger"){
		let dps = round(1000*data.stats.damage/data.stats.cooldown,2);
		s += printKeyAndData("Create Gun", dps + " DPS");
		s += printKeyAndData("Duration", data.duration);
	}*/
	else if(tag == "ExtraShieldTriggerBonus"){
		if(data.maxStrength != 0)			s += printKeyAndDataBonus("Shield Strength", BonusPrefix(data.maxStrength));
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefix(data.duration) + " ms");
	}/*
	else if(tag == "GunProcTrigger"){
		s += "For <b>" + data.duration + "</b> ms, gun shots apply:" + "<br/>";
		s += ShowStatusEffect(data.statusEffect);
	}*/
	else if(tag == "LeapTriggerBonus"){
		if(data.collisionDamage != 0)	s += printKeyAndDataBonus("Collision Damage", BonusPrefix(data.collisionDamage));
		if(data.collisionDematerialTime != 0)	s += printKeyAndDataBonus("Collision Dematerialze Time", BonusPrefix(data.collisionDematerialTime));
		if(data.collisionManaToRefund != 0)	s += printKeyAndDataBonus("Collision Energy Refund", BonusPrefix(data.collisionManaToRefund));
		if(data.range != 0)	s += printKeyAndDataBonus("Leap Distance", BonusPrefix(data.range));
	}
	else if(tag == "SharkletTriggerBonus"){
		if(data.count != 0)						s += printKeyAndDataBonus("Missile Count", BonusPrefix(data.count));
		if(data.damage != 0)					s += printKeyAndDataBonus("Damage", BonusPrefix(data.damage));
		if(data.range != 0)						s += printKeyAndDataBonus("Range", BonusPrefix(data.range));
	}
	return s;
}
function ShowStatusEffect(effect)
{

	var s = ""; var damage = 0;
	if(effect.tag == "FreezeEffect") s += printKeyAndData("Freeze Duration", effect.data.duration);
	if(effect.tag == "StunEffect") s += printKeyAndData("Stun Duration", effect.data.duration);
	if(effect.tag == "DoTEffect") {dotTotal = effect.data.dps*effect.data.duration/1000; s += printKeyAndData("DoT Total", dotTotal); damage += dotTotal;}
	if(effect.tag == "DamageEffect") {s += printKeyAndData("Damage", effect.data.damage); damage += effect.data.damage;}
	if(effect.tag == "BlastEffect") {s += printKeyAndData("AoE Damage", effect.data.damage);s += printKeyAndData("Radius", effect.data.radius); damage += effect.data.damage;}
	var o = {};
	o.s = s;
	o.damage = damage;
	return o;
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
	//BonusPrefix(i)
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
function printKeyAndDataBonus(key, data, cssClass){
	//BonusPrefix(i)
	cssClass = cssClass === undefined ? "" : cssClass;
	var addText = classWrap(data, cssClass == "" ? "cKeyValue" : cssClass) + " " + classWrap(key, "cKey");
	addText += "<br/>";
	return addText;
}
// Loading Stuff
var gasData = {};
var gasDataPrev = {};
var datatypesPrev = undefined;
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
  if(datatypesPrev != undefined)
    for (let i = 0; i < datatypesPrev.length; i++)
		{
			loadJsonFile("../json_previous/" + datatypesPrev[i] + ".json", function(loadedDataPrev){
				gasDataPrev[datatypesPrev[i]] = JSON.parse(loadedDataPrev);
				if(allLoaded()) parseData();
			});
		}
}
function allLoaded(){
	return dataLoaded() && dataPrevLoaded() && additionalFileLoaded;
}
function dataLoaded(){
	for (let i = 0; i < datatypes.length; i++)
	{
		if(gasData[datatypes[i]] == undefined) return false;
	}
	return true;
}
function dataPrevLoaded(){
  if(datatypesPrev == undefined) return true;
		for (let i = 0; i < datatypesPrev.length; i++)
		{
			if(gasDataPrev[datatypesPrev[i]] == undefined) return false;
		}
	return true;
}
function GetAccolades(champion){
	var accolades = [];
	for (let i = 0; i < gasData["accolade"].length; i++)
	{
		var accolade = gasData["accolade"][i];
		if(champion == accolade.champion) accolades.push(accolade);
	}
	return accolades;
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
	console.log("bullet not found: " + type);
	return null;
}
function getObject(type, bPrev = false){
	var data = bPrev ? gasDataPrev["object"] : gasData["object"];
	for (let i = 0; i < data.length; i++)
	{
		var object = data[i];
		if(type == object.name) return object;
	}
}
function getItem(type){
	for (let i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(type == item.name) return item;
	}
	console.log(type + " not found");
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
			if(!shape.noDraw)
			{
				max[0] = Math.min(point.x+x, max[0]);
				max[1] = Math.min(point.y+y, max[1]);
				max[2] = Math.max(point.x+x, max[2]);
				max[3] = Math.max(point.y+y, max[3]);
			}
			if(shape.mirror) max[1] = Math.min(-point.y+y, max[1]);
			if(shape.mirror) max[3] = Math.max(-point.y+y, max[3]);
			for (var iC in shape.clones){
				// TODO fix rotated clones making canvas bigger than needed
				var clone = shape.clones[iC];
				var angle = degToRad(clone.pos.f/10);
				var xRotated = point.x * Math.cos(angle) - point.y * Math.sin(angle);
				var yRotated = point.x * Math.sin(angle) + point.y * Math.cos(angle);
				max[0] = Math.min(xRotated+x+clone.pos.p.x, max[0]);
				max[1] = Math.min(yRotated+y+clone.pos.p.y, max[1]);
				max[2] = Math.max(xRotated+x+clone.pos.p.x, max[2]);
				max[3] = Math.max(yRotated+y+clone.pos.p.y, max[3]);
				if(shape.mirror) max[1] = Math.min(-yRotated+y+clone.pos.p.y, max[1]);
				if(shape.mirror) max[3] = Math.max(-yRotated+y+clone.pos.p.y, max[3]);
			}
		}
	}
	return max;
}
function getObjectResolution(object, weapons, radius){
	var max = [-radius,-radius,radius,radius];
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
		
		if(!shape.noDraw) DrawShape(ctx, scale, x, y, shape);
		for (var iC in shape.clones){
			var clone = shape.clones[iC];
			var angle = degToRad(clone.pos.f/10);
			DrawShape(ctx, scale, x + clone.pos.p.x, y + clone.pos.p.y, shape, angle);
		}
	}
}
function DrawShape(ctx, scale, x, y, shape, angle){
	ctx.save(); 
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.beginPath();
	
	ctx.moveTo(shape.points[0].x, shape.points[0].y);
	
	for (let j = 0; j < shape.points.length; j++)
	{
		var point = shape.points[j];
		ctx.lineTo(point.x, point.y);
	}
	if(shape.mirror)
	{
		if(shape.closed)
		{
			ctx.lineTo(shape.points[0].x, shape.points[0].y);
			this.closeShape(ctx, scale, shape.color);
			ctx.beginPath();
		}
		else
			ctx.lineTo(shape.points[shape.points.length-1].x, -shape.points[shape.points.length-1].y);
		for (let j = shape.points.length-1; j >= 0; j--)
		{
			var point = shape.points[j];
			ctx.lineTo(point.x, -point.y);
		}
		if(shape.closed)
			ctx.lineTo(shape.points[shape.points.length-1].x, -shape.points[shape.points.length-1].y);
		else
			ctx.lineTo(shape.points[0].x, shape.points[0].y);
	}
	else
		ctx.lineTo(shape.points[0].x, shape.points[0].y);
	this.closeShape(ctx, scale, shape.color);
	ctx.restore();
}
function closeShape(ctx, scale, color){
	ctx.lineWidth = 1.5/scale;
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.fillStyle = numberToHex(color);
	ctx.fill();
	
	ctx.closePath();
}
function draw(data, scale = 0.4, bPrev = false, bDrawRadius = false)
{
	var object = getObject(data.objectType, bPrev);
	if(object == undefined) {
		console.log("Can't find " + data.objectType);
		return document.createElement('canvas');
	}
	var radius = bDrawRadius ? (data.collisionRadius == undefined ? 0 : data.collisionRadius / scale) : 0;
	var res = getObjectResolution(object, data.weapons, radius);
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
				drawShapes(ctx, scale, x+offset[0], y+offset[1], getObject(turret, bPrev));
			}
		}
		DrawCollisionRadius(radius, ctx, scale, x, y);
	}
	return canvas;
}
function DrawCollisionRadius(radius, ctx, scale, x, y)
{
	if(!radius) return;
	ctx.beginPath();
	ctx.lineWidth = 1/scale;
	ctx.strokeStyle = "#FFFFFFAA";
	ctx.arc(x, y, radius, 0, Math.PI*2);
	ctx.stroke();
	ctx.closePath();
}
function DrawPoly(ctx, scale, poly, offset, color)
{
	ctx.beginPath();
	ctx.moveTo(poly[0].x+offset, poly[0].y+offset);
	for (let j = 0; j < poly.length; j++)
	{
		var point = poly[j];
		ctx.lineTo(point.x+offset, point.y+offset);
	}
	ctx.lineTo(poly[0].x+offset, poly[0].y+offset);
	ClosePoly(ctx, scale, color);
}
function ClosePoly(ctx, scale, color){
	ctx.lineWidth = 1.5/scale;
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}
function DrawMap(name, scale, bPrev = false)
{
	var canvas = document.createElement('canvas');
	canvas.width = MAP_CANVAS_SIZE;
	canvas.height = MAP_CANVAS_SIZE;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.scale(scale, scale);
		MakeMap(ctx, scale, name, bPrev ? gasDataPrev["map"] : gasData["map"]);
	}
	return canvas;
}
function DrawCircle(ctx, scale, point, radius, offset, color)
{
	ctx.beginPath();
	ctx.arc(point.x+offset, point.y+offset, radius/scale, 0, Math.PI*2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}
function DrawLane(ctx, scale, points, offset, color)
{
	ctx.beginPath();
	ctx.moveTo(points[0].x+offset, points[0].y+offset);
	for (let j = 0; j < points.length; j++)
	{
		var point = points[j];
		ctx.lineTo(point.x+offset, point.y+offset);
	}
	ctx.lineWidth = 2/scale;
	ctx.strokeStyle = color;
	ctx.stroke();
}
function MakeMap(ctx, scale, mapName, data)
{
	for (let m = 0; m < data.length; m++)
	{
		var map = data[m];
		if(map.name != mapName) continue;
	
		for (let i = 0; i < map.regions.length; i++)
		{
			var region = map.regions[i];
			var color = GetRegion(region.regionType).mapColor;
			DrawPoly(ctx, scale, region.poly, map.mapRadius, numberToHex(color));
		}
		/*for (let i = 0; i < map.beacons.length; i++)
		{
			var beacon = map.beacons[i];
			DrawCircle(ctx, scale, beacon, 3, map.mapRadius, "#00FFFF");//66EEEE
		}*/
		for (let i = 0; i < map.spawnPoints.length; i++)
		{
			var spawnPoint = map.spawnPoints[i];
			DrawCircle(ctx, scale, spawnPoint, 3, map.mapRadius, "#00FF00");//78E810
		}
		if(map.miniBossSpawns != undefined) for (let i = 0; i < map.miniBossSpawns.length; i++)
		{
			var miniBoss = map.miniBossSpawns[i];
			DrawCircle(ctx, scale, miniBoss, 2, map.mapRadius, "#AA4400");
		}
		for (let i = 0; i < map.lanes.length; i++)
		{
			var lane = map.lanes[i];
			var color = GetLane(lane.laneType).color;
			DrawLane(ctx, scale, lane.waypoints, map.mapRadius, "#553333");
		}
	}
}