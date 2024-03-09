const SCALE_STANDARD = 0.5;
const SCALE_SMALL = 0.25;
const MAP_CANVAS_SIZE = 600;
const monsterSkip = {"Iron Justiciar":true, "Test Event Boss 2":true, "Test Event Boss":true, "Test Event Minion":true};

const TIER_COLORS = ["","#FF7777","#77CC77","#9999FF","#77DDDD","#FFFF77","#EB98CB","#F5A849","#C162F5","#FFFFFF","#8EC726"];
const TIER_NAMES = ["","Alpha","Beta","Gamma","Delta","Epsilon","Omega","","","","Precursor Tech"];
const MODULE_CREDITS = [0,5,10,25,50,100,250,500,1000];
const MAX_LEVEL = 20;
const SHIELD_STRENGTH_PER_RADIUS = 20;
const MANA_PER_SECOND = 2.5;
// [ui name, type name, item flag key]
const SLOT_TYPES = {
	"0": ["Gun Upgrades", "Guns", "guns"],
	"1": ["Defense Upgrades", "Defenses", "defenses"],
	"2": ["Trigger Upgrades", "Triggers", "triggers"],
	"3": ["Engine Upgrades", "Engines", "engines"],
	"4": ["Precursor Tech", "Precursor Tech", "precursorTech"],
	"5": ["Equipment", "Equipment", ""]
}
const ADDON_TIER_NAMES = {
	"0": "Common",
	"1": "Uncommon",
	"2": "Rare",
	"3": "Epic",
	"4": "Legendary",
	"5": "Mythic",
}
const STATS = {
	BLAST_DAMAGE: 21,
	BOMB_DAMAGE: 22,
	MISSILE_DAMAGE: 23,
}
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
	"9": ["SHIELD_STRENGTH", "Shield Strength"],
	"10": ["RADIUS", "Hull Radius"],
	"11": ["TRIGGER_COST", "Trigger Energy Cost"],
	"12": ["ULT_FIRE_RATE", "Trigger 4 Rate of Fire"],
	"13": ["TOP_SPEED", "Top Speed"],
	"14": ["GUN_ARC", "Gun Arc"],
	"15": ["DAMAGE_VS_BURNING", "Damage vs Burning"],
	"16": ["ACCELERATION", "Acceleration"],
	"17": ["SCOOT_RATE", "Scoot Rate"],
	"18": ["TURN_RATE", "Turn Rate"],
	"19": ["XP_RATE", "XP Bonus"],
	"20": ["DAMAGE_VS_FROZEN", "Damage vs Frozen/Chilled"],
	"21": ["BLAST_DAMAGE", "Blast Damage"],
	"22": ["BOMB_DAMAGE", "Bomb Damage"],
	"23": ["MISSILE_DAMAGE", "Missile Damage"]
};
const ACTIVE_WHILE_NAMES = {
	"0": ["ALWAYS", "always"],
	"1": ["HEALTH_FULL", "undamaged"],
	"2": ["HEALTH_BELOW_100", "damaged"],
	"3": ["HEALTH_BELOW_75", "hull below 75%"],
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
	"19": ["NOT_ROTATING", "not rotating"],
	"20": ["OUT_OF_COMBAT", "out of combat"],
	"21": ["NEW_CHARACTER", "on new character"]
};
const TRIGGER_TO_WHEN = [1,7,8,4];
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
	"12": ["ON_ITEM_PICKUP", "item picked up"],
	"13": ["ON_SHOOT", "shot hit"],
};
const PLAYER_POLICIES = {
	"0": ["IGNORE", "Ignore"],
	"1": ["APPROACH", "Approach"],
};

// Helpers
function GetArcShield(data)
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
function GetArc(halfArc)
{
	return "<b>"+(halfArc*0.2)+"°</b>";
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
// TODO use stat idx of first stat instead of string category
const ITEM_SORTING_INDEX =
{
	"Booster": 1,
	"Plate": 2,
	"Generator": 3,
	"Loader": 4,
	"Fixer": 5,
	"Cycler": 6,
	"Charger": 7,
	"Capacitor": 8,
	"Displacer": 9,
	"Rotator": 10,
	"Accelerator": 11,
	"Blaster": 12,
	"Detonator": 13,
	"Warhead": 14,
}
function GetItemSortingIndex(item)
{
	for (let category in ITEM_SORTING_INDEX)
	{
		if(item.name.includes(category))
			return ITEM_SORTING_INDEX[category];
	}
	return 0;
}
function ItemSort(a, b)
{
	if(GetItemSortingIndex(a) > GetItemSortingIndex(b))
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
	var hasGlobalDrops = !(monster.itemPackDrops != undefined && monster.itemPackDrops.length > 0) && givesXP;
	var t = getTier(monster.xp) - 2;
	return(t > 0 && t <= 6) && hasGlobalDrops;
}
function IsBlast(params)
{
	if(IsShotgun(params, true))
		return true;
	return false;
}
function IsBomb(params)
{
	if(IsShotgun(params, false))
		return true;
	return false;
}
function IsShotgun(params, bHasNoOffset)
{
	if(!Array.isArray(params) && params.tag == "MineTrigger" && (params.data.damage > 0) && !bHasNoOffset)
		return true;
	if(!Array.isArray(params) && params.tag == "ShotgunTrigger" && (params.data.damage > 0) && (HasNoOffset(params.data) == bHasNoOffset))
		return true;
	for (var p in params)
	{
		if(params[p].tag == "MineTrigger" && (params[p].data.damage > 0) && !bHasNoOffset)
			return true;
		if(params[p].tag == "ShotgunTrigger" && (params[p].data.damage > 0) && (HasNoOffset(params[p].data) == bHasNoOffset))
			return true;
	}
	return false;
}
function IsMissile(params)
{
	if(!Array.isArray(params) && params.tag == "SharkletTrigger")
		return true;
	for (var p in params)
	{
		if(params[p].tag == "SharkletTrigger")
			return true;
	}
	return false;
}
function HasNoOffset(data)
{
	if(data.offset.x == 0 && data.offset.y == 0) return true;
	return false;
}
// ITEMS and SYMBS
function SpeakerToText(data)
{
	s = "";
	for (var ql in data.quoteLists){
		var quoteList = data.quoteLists[ql];
		s += "<b>"+quoteList.tag+"</b>"+"<br/>";
		for (var quote in quoteList.quotes)
		{
			s += quoteList.quotes[quote].text+"<br/>";
		}
	}
	return s;
}
function SlotTypeToText(data)
{
	var s = "";
	for(var i in SLOT_TYPES)
	{
		var type = SLOT_TYPES[i];
		if(data[type[2]] == 1) s += type[1] + ", ";
	}

	return s;
}
function MakeStatsTable(mainData, tier, bSymbiote = false, bPortrait = false, bDescription = true, bSpeaker = false, idxTrigger = -1)
{
	if(tier == 0) tier = mainData.tier;
	if(mainData.credits != undefined) tier = mainData.credits;
	else if(mainData.rarity != undefined) tier = mainData.rarity + 1;
	var tbl = document.createElement('table');
	let th = tbl.insertRow();

	if(bSymbiote && bPortrait)
	{
		var image = new Image();
		image.src = "https://gasgame.net/portrait/"+mainData.name+".png";
		//image.height = "64";
		var img = makeCellE(image, th);
		img.rowSpan = 10;
	}
	
	var name = mainData.displayName != undefined ? mainData.displayName : mainData.name;
	if(mainData.championName != undefined) name = name + " (" + mainData.championName + ")";
	if(mainData.mana != undefined) name = name + " - " + classWrap(mainData.mana, "energy");
	makeHeaderCell(colorWrap(name, TIER_COLORS[tier]), th);
	
	var slotTypes = SlotTypeToText(mainData);
	if(slotTypes != "")
	{
		let th2 = tbl.insertRow();
		makeHeaderCell(trimListBy(slotTypes, 2), th2);
	}

	if(bDescription && mainData.description != undefined && mainData.description != "")
	{
		makeCell(mainData.description, tbl.insertRow());
	}
	if(bSymbiote && bSpeaker)
	{
		makeCell(SpeakerToText(GetSpeaker(mainData.name)), tbl.insertRow());
	}
	let prevCondition = undefined;
	let prevCell;
	let prevRepeat = false;
	let delayArray = [];
	let dps = 0;
	if(mainData.effects == undefined && idxTrigger != -1) // is trigger
	{
		var tempTriggers = mainData.params;
		// repackage trigger format to symb/item format
		mainData.effects = [];
		for (var triggerParams in tempTriggers){
			mainData.effects.push({"data":{"params":tempTriggers[triggerParams],"when":TRIGGER_TO_WHEN[idxTrigger]},"tag": "TriggeredTriggerEffect"})
		}
	}
	for (var effect in mainData.effects){
		let data = mainData.effects[effect].data;
		let mainTag = mainData.effects[effect].tag;
		var activeWhile = data.activeWhile;
		s = "";
		if(mainTag == "ItemStat" || mainTag == "ItemShield")
		{
			if(activeWhile != undefined && activeWhile != 0) 
			{
				if(prevCondition != undefined && prevCondition == activeWhile) prevRepeat = true; else prevRepeat = false;
				if(!prevRepeat) try{ s += "While " + classWrap(ACTIVE_WHILE_NAMES[activeWhile][1], "cKeyValue") + ":<br/>"; }
				catch(e) {console.log("while " + activeWhile + " not found");}
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
				s += printKeyAndData("Shield", colorWrap("Arc "+GetArcShield(data.shield), hex));
				// TODO show facing, calculate with right and left
			}
		}
		else if(mainTag == "TriggeredTriggerEffect" || mainTag == "TriggeredHealMineBurst")
		{
			if(prevCondition != undefined && prevCondition == data.when) prevRepeat = true; else prevRepeat = false;
			if(!prevRepeat) try{ s += "On " + classWrap(TRIGGERED_TRIGGER_EFFECTS[data.when][1], "cKeyValue") + ":<br/>"; }
			catch(e) {console.log("when " + data.when + " not found");}
			prevCondition = data.when;

			if(TRIGGERED_TRIGGER_EFFECTS[data.when][2] == undefined) TRIGGERED_TRIGGER_EFFECTS[data.when][2] = 0;
			TRIGGERED_TRIGGER_EFFECTS[data.when][2]++;
			if(TRIGGERED_TRIGGER_EFFECTS[data.when][3] == undefined) TRIGGERED_TRIGGER_EFFECTS[data.when][3] = {};
			TRIGGERED_TRIGGER_EFFECTS[data.when][3][mainData.name] = 1;
			
			if(mainTag == "TriggeredTriggerEffect")
			{
				let o = GetTriggeredEffectString(data.params.tag, data.params.data, delayArray);
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
			s += data.percentChance != 100 ? (classWrap(data.percentChance + "%", "cKeyValue") + " to affect gun shots:<br/>") : "Affects gun shots:<br/>";
			s += AddEffectsText(data);
			if(data.maxProcsPerSecond != undefined && data.maxProcsPerSecond != 0) s += "Maximum " + data.maxProcsPerSecond + " applications per second";
		}
		else if(mainTag == "GunCharger")
		{
			s += "Every " + ToTime(data.cooldown) + " double gun damage for next shot<br/>";
			//s += AddEffectsText(data);
		}
		else if(mainTag == "PlayerGunStats")
		{
			let gundps = round(1000*data.damage/data.cooldown,2);
			s += MakeGunStats(data);
			dps += gundps;
		}
		else if(mainTag == "PeriodicTriggerEffect")
		{
			var chanceTo = "";
			if(data.percentChance != undefined && data.percentChance != 100)
				chanceTo = ", " + classWrap(data.percentChance + "%", "cKeyValue") + " to";
			var condition = activeWhile != undefined ? ("While " + classWrap(ACTIVE_WHILE_NAMES[activeWhile][1], "cKeyValue")+", every ") : "Every ";
			s += condition + classWrap(ToTime(data.cooldown), "cKeyValue") + chanceTo + ":<br/>";
			let cooldownAndChanceMult = (10/data.cooldown)*data.percentChance;
			
			for (var p in data.params){
				var effect = data.params[p];
				let o = GetTriggeredEffectString(effect.tag, effect.data, delayArray);
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
			if(data.cooldown != undefined) s += printKeyAndData("Cooldown", ToTime(data.cooldown));
			let cooldownMult = 1000/data.cooldown;
			s += printKeyAndData("Range", data.range, "", AddReticle(data.reticleColor));
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
			prevCell = makeCell(s, tbl.insertRow());
			prevCell.colSpan = 2;
		}
	}
	prevCell.innerHTML += GetTriggeredEffectDelayArray(delayArray);
	if(countAoE > 1) prevCell.innerHTML += "<b>x"+countAoE+"</b>";
	hashAoE = "";
	countAoE = 0;
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
	s += printKeyAndData("Duration", ToTime(data.duration));
	s += MakePowerText(data);
	return s;
}
function MakePowerText(data)
{
	var s = "";
	if(data.powers != undefined)
		for(let i = 0; i < data.powers.length; i++)
		{
			let powerData = data.powers[i].data;
			let power = data.powers[i].tag;
			if(power == "StatPower")
			{
				s += printKeyAndData(GetStat(powerData.statType, 1), BonusPrefix(powerData.amount) + "%");
				s += printKeyAndData("Duration", ToTime(powerData.duration));
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
function MakeGunStats(data)
{
	var s = "";
	let gundps = round(1000*data.damage/data.cooldown,2);
	s += printKeyAndData("Gun", gundps + " DPS");
	s += printKeyAndData("├ Damage", data.damage);
	s += printKeyAndData("├ RoF", round(1000/data.cooldown,2), "", "/s");
	s += printKeyAndData("├ Range", data.range, "", AddReticle(data.reticleColor));
	var finish = "└ ";
	if(data.f != 0) finish = "├ ";
	s += printKeyAndData(finish + "Arc", (data.halfArc * 0.2) + "°");
	if(data.f != 0) s += printKeyAndData("└ Facing", (data.f/10));
	return s;
}
function ShowStatusEffect(effect)
{

	var s = ""; var damage = 0;
	var bSkipExtraInfo = false;
	if(effect.tag == "NoEffect") ;
	else if(effect.tag == "RootEffect") s += printKeyAndData("Immobilize Duration", ToTime(effect.data.duration));
	else if(effect.tag == "FreezeEffect") s += printKeyAndData("Freeze Duration", ToTime(effect.data.duration));
	else if(effect.tag == "StunEffect") s += printKeyAndData("Stun Duration", ToTime(effect.data.duration));
	else if(effect.tag == "DisarmEffect") s += printKeyAndData("Disarm Duration", ToTime(effect.data.duration));
	else if(effect.tag == "SusceptibleEffect") s += printKeyAndData("Susceptibility Duration", ToTime(effect.data.duration));
	else if(effect.tag == "BurningEffect") {dotTotal = effect.data.dps*effect.data.duration/1000; s += printKeyAndData("Burn Damage", dotTotal + " over " + ToTime(effect.data.duration)); damage += dotTotal;}
	else if(effect.tag == "DoTEffect") {dotTotal = effect.data.dps*effect.data.duration/1000; s += printKeyAndData("DoT", dotTotal + " over " + ToTime(effect.data.duration)); damage += dotTotal;}
	else if(effect.tag == "ChillEffect")s += printKeyAndData("Chill Duration", ToTime(effect.data.duration));
	else if(effect.tag == "GlyphCircleEffect") bSkipExtraInfo = true;
	else if(effect.tag == "ParticleLineEffect") ;
	else if(effect.tag == "PlaySoundEffect") ;
	else if(effect.tag == "BlastEffect") {s += printKeyAndData("AoE Damage", effect.data.damage);s += printKeyAndData("Radius", effect.data.radius); damage += effect.data.damage;}
	else if(effect.tag == "DamageEffect") {s += printKeyAndData("Damage", effect.data.damage); damage += effect.data.damage;}
	else if(effect.tag == "VampEffect") s += printKeyAndData((effect.data.appliesToMana == 1 ? "Energy Recharge" : "Vampiric Repair") + " per hit", effect.data.healing, (effect.data.appliesToMana == 1 ? "energy" : "heal"));
	else console.log("uncaught effect: " + effect.tag);
	if(!bSkipExtraInfo && effect.data.reducedDurationOnBoss != undefined && effect.data.reducedDurationOnBoss == 1) s += "Reduced duration on bosses<br/>";
	if(effect.data.stack != undefined && effect.data.stack == 1) s += "Effect stacks<br/>";
	var o = {};
	o.s = s;
	o.damage = damage;
	return o;
}
function AddEffectsText(data)
{
	var s = "";
	if(data.statusEffects != undefined) for(let i = 0; i < data.statusEffects.length; i++)
	{
		s += ShowStatusEffect(data.statusEffects[i]).s;
	}
	return s;
}
var hashAoE = "";
var countAoE = 0;
function GetTriggeredEffectDelayArray(array)
{
	var string = "";
	var lastDelay = 0;
	var actualDelays = 0;
	for (var i in array){
		var delay = array[i];
		// only show "0s" delay if it's in a succession of different delays (don't show single delay of 0s but show Blood Imp starting at 0s)
		if(delay > lastDelay || (array.length > 1 && i == 0))
		{
			actualDelays++;
			lastDelay = delay;
			if(i != 0)
				string += ", ";
			string += ToTime(delay);
		}
	}
	if(array.every((currentValue) => currentValue == 0)) string = "";
	return string == "" ? "" : printKeyAndData(actualDelays > 1 ? "Delays" : "Delay", string);
}
function GetBlastOrBombString(data)
{
	return (HasNoOffset(data) ? "Blast" : "Bomb");
}
function GetTriggeredEffectString(tag, data, delayArray)
{
	var s = ""; var damage = 0;
	if(tag == "FireRateBoostTrigger"){
		s += printKeyAndData("Rate of Fire Boost", data.amount + "%");
		s += printKeyAndData("Duration", ToTime(data.duration));
	}
	else if(tag == "ShotgunTrigger"){
		var newHashAoE = data.damage + data.range + data.halfArc;
		countAoE += 1 + data.mirror;
		if(hashAoE != newHashAoE)
		{
			if(data.tooltip != "") s += data.tooltip + "<br/>";
			if(data.damage > 0) s += printKeyAndData(GetBlastOrBombString(data) + " Damage", data.damage);
			s += printKeyAndData("Range", data.range, "", AddReticle(data.reticleColor));
			//if(data.delay > 0) s += printKeyAndData("First Delay", ToTime(data.delay));
			s += printKeyAndData("Arc", (data.halfArc * 0.2) + "°");
			s += AddEffectsText(data);
		}
		// TODO this might become problematic if something uses both
		// TODO show difference by indicating which delay is centered on tank or remains where used (Yeti Storm vs Blood Imp)
		if(data.targetingDelay == 0) delayArray.push(data.delay);
		if(data.delay == 0) delayArray.push(data.targetingDelay);
		damage += data.damage;
		hashAoE = newHashAoE;
	}
	else if(tag == "CannonTrigger"){
		var newHashAoE = data.count + data.damage + data.range + data.speed;
		if(hashAoE != newHashAoE)
		{
			s += "Fire " + data.count + " piercing cannon shells<br/>";
			s += printKeyAndData("├ Radius", data.radius);
			s += printKeyAndData("├ Damage", data.damage);
			s += printKeyAndData("├ Range", data.range);
			s += printKeyAndData("└ Speed", data.speed);
			s += AddEffectsText(data);
		}
		delayArray.push(data.delay);
		damage += data.damage * data.count;
		hashAoE = newHashAoE;
	}
	else if(tag == "CooldownResetTrigger"){
		s += "Reset cooldown on <b>trigger " + (data.triggerIndex+1) + "</b>" + "<br/>";
	}
	else if(tag == "HealOverTimeTrigger"){
		s += printKeyAndData("Heal Amount", data.amount + (data.asPercentage == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
		s += printKeyAndData("Duration", ToTime(data.duration));
	}
	else if(tag == "ProjectilePurgeTrigger"){
		s += "Destroy enemy projectiles within radius of <b>" + data.radius + "</b>" + "<br/>";
	}
	else if(tag == "PickupPackTrigger"){
		s += MakePickupPackText(data);
	}
	else if(tag == "MineTrigger")
	{
		s += printKeyAndData("Bomb Damage", data.damage);
		s += printKeyAndData("Range", data.burstRadius);
		s += printKeyAndData("Duration", ToTime(data.duration));
		damage += data.damage;
	}
	else if(tag == "AreaHealTrigger"){
		if(data.amount > 0) s += printKeyAndData("Repair Amount", data.amount, "heal");
		s += printKeyAndData("Effect Burst: Radius", data.radius);
		s += MakePowerText(data);
	}
	else if(tag == "ShieldRefillTrigger"){
		s += printKeyAndData("Shield Refill", data.refillPercentage + "%");
	}
	else if(tag == "HealTrigger"){
		s += printKeyAndData((data.applyToMana == 1 ? "Energy Recharge" : "Repair") + " Amount", data.healAmount + (data.asPercentage == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
	}
	else if(tag == "StatBoostTrigger"){
		s += printKeyAndData(GetStat(data.statType, 1), data.amount + "%");
		s += printKeyAndData("Duration", ToTime(data.duration));
		if(data.maxStacks > 0) s += printKeyAndData("Max Stacks", data.maxStacks);
	}
	else if(tag == "DematerializeTrigger"){
		if(data.percentChance != undefined && data.percentChance != 100)
			s += printKeyAndData("Dematerialize Chance", data.percentChance + "%");
		s += printKeyAndData("Dematerialize Duration", ToTime(data.duration));
	}
	else if(tag == "ExtraGunTrigger"){
		let dps = round(1000*data.stats.damage/data.stats.cooldown,2);
		s += "Create gun for <b>" + ToTime(data.duration) + "</b>:" + "<br/>";
		s += MakeGunStats(data.stats);
		damage += dps*(data.duration/1000);
	}
	else if(tag == "ExtraShieldTrigger"){
		var hex = numberToHex(data.stats.color);
		s += "Temporary shield for <b>" + ToTime(data.duration) + "</b>:" + "<br/>";
		s += printKeyAndData("Shield", "Strength " + data.stats.maxStrength);
		s += printKeyAndData("Shield", colorWrap("Arc "+GetArcShield(data.stats), hex));
	}
	else if(tag == "GunProcTrigger"){
		s += "For <b>" + ToTime(data.duration) + "</b>, gun shots apply:" + "<br/>";
		let o = ShowStatusEffect(data.statusEffect);
		s += o.s;
		damage += o.damage;
	}
	else if(tag == "LeapTrigger"){
		s += printKeyAndData("Leap Distance", data.range);
		if(data.collisionSettings.vamp) s += "Collision Heals<br/>";
		if(data.collisionSettings.triggerIndexToResetCooldown != -1)s += printKeyAndData("Collision Cooldown Set To", ToTime(data.collisionSettings.cooldownToRetain));
		if(data.collisionSettings.damage > 0) s += printKeyAndData("Collision Damage", data.collisionSettings.damage);
		if(data.collisionSettings.dematerialTime > 0) s += printKeyAndData("Collision Dematerialze Time",  ToTime(data.collisionSettings.dematerialTime));
	}
	else if(tag == "SharkletTrigger"){
		s += printKeyAndData("Missile Count", data.count);
		s += printKeyAndData("Damage", data.damage);
		s += printKeyAndData("Range", data.range);
		for (var effects in data.statusEffects){
			var effect = data.statusEffects[effects];
			let o = ShowStatusEffect(effect);
			s += o.s;
		}
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
		if(data.targetingDelay != 0)	s += printKeyAndDataBonus("Targeting Delay", BonusPrefixToTime(data.targetingDelay));
		s += AddEffectsText(data);
	}
	if(tag == "MineTriggerBonus"){
		// TODO duration, armingTime
		if(data.damage != 0)					s += printKeyAndDataBonus("Bomb Damage", BonusPrefix(data.damage));
		if(data.burstRadius != 0)			s += printKeyAndDataBonus("Burst Radius", BonusPrefix(data.burstRadius));
		if(data.sensitivityRadius != 0)	s += printKeyAndDataBonus("Sensitivity Radius", BonusPrefix(data.sensitivityRadius));
	}
	else if(tag == "HealOverTimeTriggerBonus"){
		if(data.amount != 0)					s += printKeyAndDataBonus("Repair Amount", BonusPrefix(data.amount));
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefixToTime(data.duration));
	}
	else if(tag == "ShieldRefillTriggerBonus"){
		if(data.refillPercentage != 0)	s += printKeyAndDataBonus("Shield Refill", BonusPrefix(data.refillPercentage) + "%");
	}
	else if(tag == "HealTriggerBonus"){
		if(data.healAmount != 0)			s += printKeyAndDataBonus("Repair Amount", BonusPrefix(data.healAmount) + (data.usePercentInTooltip == 1 ? "%" : ""), data.applyToMana == 1 ? "energy" : "heal");
	}
	else if(tag == "StatBoostTriggerBonus"){
		if(data.amount != 0)					s += printKeyAndDataBonus((data.statType != undefined) ? GetStat(data.statType, 1) : "Boost Amount", BonusPrefix(data.amount) + "%");
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefixToTime(data.duration));
	}
	else if(tag == "DematerializeTriggerBonus"){
		if(data.percentChance != 0)		s += printKeyAndDataBonus("Dematerialize Chance", BonusPrefix(data.percentChance) + "%");
		if(data.duration != 0)				s += printKeyAndDataBonus("Dematerialize Duration", BonusPrefixToTime(data.duration));
	}/*
	else if(tag == "ExtraGunTrigger"){
		let dps = round(1000*data.stats.damage/data.stats.cooldown,2);
		s += printKeyAndData("Create Gun", dps + " DPS");
		s += printKeyAndData("Duration", data.duration);
	}*/
	else if(tag == "ExtraShieldTriggerBonus"){
		if(data.maxStrength != 0)			s += printKeyAndDataBonus("Shield Strength", BonusPrefix(data.maxStrength));
		if(data.duration != 0)				s += printKeyAndDataBonus("Duration", BonusPrefixToTime(data.duration));
	}/*
	else if(tag == "GunProcTrigger"){
		s += "For <b>" + data.duration + "</b> ms, gun shots apply:" + "<br/>";
		s += ShowStatusEffect(data.statusEffect);
	}*/
	else if(tag == "LeapTriggerBonus"){
		if(data.collisionDamage != 0)	s += printKeyAndDataBonus("Collision Damage", BonusPrefix(data.collisionDamage));
		if(data.collisionDematerialTime != 0)	s += printKeyAndDataBonus("Collision Dematerialze Time", BonusPrefixToTime(data.collisionDematerialTime));
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
function printKeyAndData(key, data, cssClass = "", extraText = ""){
	var addText = classWrap(key, "cKey") + ": " + classWrap(data, cssClass == "" ? "cKeyValue" : cssClass) + extraText;
	if(key == "color")
	{
		var hex = numberToHex(data);
		addText += " (" + colorWrap(hex, hex) + ")";
	}
	addText += "<br/>";
	return addText;
}
function printKeyAndDataBonus(key, data, cssClass = ""){
	var addText = classWrap(data, cssClass == "" ? "cKeyValue" : cssClass) + " " + classWrap(key, "cKey");
	addText += "<br/>";
	return addText;
}
function AddReticle(color)
{
	return colorWrap(" &#9711;", numberToHex(color));
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
		if(champion == accolade.champion || accolade.champion == "") accolades.push(accolade);
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
	console.log("lair not found: " + type);
}
function getLairForFaction(factionName, tag){
	for (let i = 0; i < gasData["faction"].length; i++)
	{
		var faction = gasData["faction"][i];
		if(factionName == faction.name)
		for (let f = 0; f < faction.factionLairs.length; f++)
		{
			var lair = faction.factionLairs[f];
			if(tag == lair.monsterFieldTag) return getLair(lair.lairType);
		}
	}
	console.log("faction not found: " + faction);
}
function getMonster(type){
	for (let i = 0; i < gasData["monster"].length; i++)
	{
		var monster = gasData["monster"][i];
		if(type == monster.name) return new Monster(monster);
	}
}
function getExplosion(type){
	for (let i = 0; i < gasData["explosion"].length; i++)
	{
		var explosion = gasData["explosion"][i];
		if(type == explosion.name) return explosion;
	}
}
function getEmitter(type){
	for (let i = 0; i < gasData["emitter"].length; i++)
	{
		var emitter = gasData["emitter"][i];
		if(type == emitter.name) return emitter;
	}
}
function getExplosionSound(name){
	if(name == undefined || name == "") return "";
	return getExplosion(name).sound;
}
function getSoundPack(type){
	for (let i = 0; i < gasData["soundpack"].length; i++)
	{
		var soundPack = gasData["soundpack"][i];
		if(type == soundPack.name) return soundPack;
	}
	var notFound = {};
	notFound.name = type + "(NOT FOUND)";
	notFound.sounds = [];
	return notFound;
}
function getSoundFromPack(name){
	var pack = getSoundPack(name);
	return pack.sounds[0];
}
function getAnimation(type){
	for (let i = 0; i < gasData["animation"].length; i++)
	{
		var animation = gasData["animation"][i];
		if(type == animation.name) return animation;
	}
	console.log("animation not found: " + type);
	return null;
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
	console.log("object not found: " + type);
	return null;
}
function getItem(type){
	for (let i = 0; i < gasData["item"].length; i++)
	{
		var item = gasData["item"][i];
		if(type == item.name) return item;
	}
	console.log(type + " Item not found");
}
function getAddon(type){
	for (let i = 0; i < gasData["addon"].length; i++)
	{
		var item = gasData["addon"][i];
		if(type == item.name) return item;
	}
	console.log(type + " Addon not found");
}
function getItemPack(type){
	for (let i = 0; i < gasData["itempack"].length; i++)
	{
		var item = gasData["itempack"][i];
		if(type == item.name) return item;
	}
	console.log(type + " Item Pack not found");
}
function GetGlobals(){
	for (let i = 0; i < gasData["globals"].length; i++)
	{
		var g = gasData["globals"][i];
		if("Globals" == g.name) return g;
	}
	console.log(type + " globals not found");
}
function GetSpeaker(type){
	for (let i = 0; i < gasData["speaker"].length; i++)
	{
		var speaker = gasData["speaker"][i];
		if(type == speaker.name) return speaker;
	}
	console.log(type + " Speaker not found");
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
function getObjectResolution(object, weapons, shields, radius, scale){
	var maxShieldAdd = 0;
	for (var sh in shields){
		var shield = shields[sh];
		maxShieldAdd = Math.max(maxShieldAdd, (shield.additionalRadius + shield.thickness));
	}
	radius += maxShieldAdd;
	// TODO dirty hack, figure out what's going on with scaling
	radius /= scale == 0.5 ? scale : 1;
	var max = [-radius,-radius,radius,radius];
	max = this.getMaxFromShapes(object, 0, 0, max);
	if(weapons != undefined)
	for (let i = 0; i < weapons.length; i++)
	{
		var turret = weapons[i].objectType;
		if(turret != "")
		{
			var offset = [0,0,0];
			var attach = weapons[i].attachmentPoint;
			// TODO offset[0] which is facing
			if(attach != "") offset = this.getAttachmentPoint(object, attach);
			//var angle = offset[0];
			//var xRotated = offset[1] * Math.cos(angle) - offset[2] * Math.sin(angle);
			//var yRotated = offset[1] * Math.sin(angle) + offset[2] * Math.cos(angle);
			max = this.getMaxFromShapes(getObject(turret), offset[1], offset[2], max);
		}
	}
	return [max[2]-max[0],max[3]-max[1],-(max[0]+(max[2]-max[0])/2),-(max[1]+(max[3]-max[1])/2)];
}
function getAttachmentPoint(object, name){
	for (let i = 0; i < object.attachmentPoints.length; i++)
	{
		var point = object.attachmentPoints[i];
		if(point.name == name) return [degToRad(point.pos.f/10), point.pos.p.x, point.pos.p.y];
	}
}
function drawShapes(ctx, scale, x, y, object, angle = 0)
{
	for (let i = 0; i < object.shapes.length; i++)
	{
		var shape = object.shapes[i];
		
		if(!shape.noDraw) DrawShape(ctx, scale, x, y, shape, angle);
		for (var iC in shape.clones){
			var clone = shape.clones[iC];
			var angleClone = degToRad(clone.pos.f/10);
			var xClone = clone.pos.p.x;
			var yClone = clone.pos.p.y;
			var xRotated = xClone * Math.cos(angle) - yClone * Math.sin(angle);
			var yRotated = xClone * Math.sin(angle) + yClone * Math.cos(angle);
			DrawShape(ctx, scale, x + xRotated, y + yRotated, shape, angle + angleClone);
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
function draw(data, scale = 0.4, bPrev = false, bDrawRadius = false, bDrawShields = false)
{
	//scale = 1;
	var object = getObject(data.objectType, bPrev);
	if(object == undefined) {
		console.log("Can't find " + data.objectType);
		return document.createElement('canvas');
	}
	var radius = data.collisionRadius == undefined ? 0 : data.collisionRadius;
	var res = getObjectResolution(object, data.weapons, bDrawShields ? data.shields : [], radius, scale);
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
				var offset = [0,0,0];
				var attach = data.weapons[i].attachmentPoint;
				if(attach != "") offset = getAttachmentPoint(object, attach);
				drawShapes(ctx, scale, x+offset[1], y+offset[2], getObject(turret, bPrev), offset[0]);
			}
		}
		if(bDrawRadius) DrawCollisionRadius(radius / scale, ctx, scale, x, y);
		if(bDrawShields) for (var sh in data.shields){
			var shield = data.shields[sh];
			ctx.beginPath();
			var offset = (radius + shield.additionalRadius) / scale;
			var left = degToRad((-shield.halfArc+shield.angle)/10);
			var right = degToRad((shield.halfArc+shield.angle)/10);
			ctx.arc(x, y, offset, left, right, false);
			ctx.arc(x, y, offset + shield.thickness / scale, right, left, true);
			ctx.arc(x, y, offset, left, left, false);
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = numberToHex(shield.color);
			ctx.fill();
			ctx.closePath();
		}
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
	var data = bPrev ? gasDataPrev["map"] : gasData["map"];
	var map = GetMap(data, name);
	canvas.width = map.mapRadius / 50;
	canvas.height = map.mapRadius / 50;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.scale(scale, scale);
		MakeMap(ctx, scale, map);
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
function GetMap(data, name)
{
	for (let m = 0; m < data.length; m++)
	{
		var map = data[m];
		if(map.name == name) return map;
	}
}
function MakeMap(ctx, scale, map)
{
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