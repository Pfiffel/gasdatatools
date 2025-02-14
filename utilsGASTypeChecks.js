function IsBoosterFor(effects, stat) {
	//console.log(effects, stat)
	if (!Array.isArray(effects) && IsPermaBoostFor(effects, stat)) return true;
	if (!Array.isArray(effects) && IsTempBoostFor(effects, stat)) return true;
	for (var p in effects) {
		if (IsPermaBoostFor(effects[p], stat)) return true;
		if (IsTempBoostFor(effects[p], stat)) return true;
	}
	return false;
}
function IsPermaBoostFor(effect, stat) {
	return (effect.tag == "ItemStat" && (effect.data.statType == stat));
}
function IsTempBoostFor(effect, stat) {
	// TODO need to expand this if we get a periodic stat boost effect
	return (effect.tag == "StatBoostTrigger" && effect.data.statType == stat) ||
		(effect.tag == "TriggeredTriggerEffect" && effect.data.params.tag == "StatBoostTrigger" && effect.data.params.data.statType == stat) ||
		//(effect.tag == "PeriodicTriggerEffect" && effect.data.params[0].tag == "StatBoostTrigger" && effect.data.params[0].data.statType == stat) || 
		(effect.tag == "TriggeredTriggerEffect" && IsBoostingPackFor(effect.data.params, stat)) ||
		(effect.tag == "PeriodicTriggerEffect" && IsBoostingPackFor(effect.data.params, stat));
}
function IsBoostingPackFor(params, stat) {
	let tempParams = []; if (!Array.isArray(params)) tempParams.push(params); else tempParams = params;
	for (var p in tempParams) {
		let params = tempParams[p];
		if (params.tag == "PickupPackTrigger" && PowerListHasStatBoostFor(params.data, stat)) return true;
	}
	return false;
}
function PowerListHasStatBoostFor(data, stat) {
	for (var t in data.triggers) {
		if (data.triggers[t].tag == "StatBoostTrigger" && data.triggers[t].data.statType == stat) return true;
	}
	for (var p in data.powers) {
		if (data.powers[p].tag == "StatPower" && data.powers[p].data.statType == stat) return true;
	}
	return false;
}
function IsTempBooster(effects) {
	if (!Array.isArray(effects) && IsTempBoost(effects)) return true;
	for (var p in effects) {
		if (IsTempBoost(effects[p])) return true;
	}
	return false;
}
function IsTempBoost(effect) {
	return (effect.tag == "StatBoostTrigger") ||
		(effect.tag == "TriggeredTriggerEffect" && effect.data.params.tag == "StatBoostTrigger") ||
		(effect.tag == "TriggeredTriggerEffect" && IsBoostingPack(effect.data.params));
}
function IsBoostingPack(params) {
	if (params.tag == "PickupPackTrigger" && PowerListHasStatBoost(params.data)) return true;
	return false;
}
function PowerListHasStatBoost(data) {
	for (var t in data.triggers) {
		if (data.triggers[t].tag == "StatBoostTrigger") return true;
	}
	for (var p in data.powers) {
		if (data.powers[p].tag == "StatPower") return true;
	}
	return false;
}
function IsBlast(params) {
	if (IsShotgun(params, true) || IsShotgun(params, false))
		return true;
	return false;
}
function IsBomb(params) {
	return false;
	//if (IsShotgun(params, false))
	//	return true;
	//return false;
}
// TODO consolidate this, Array check is there for triggers specifically which have a different json structure
function IsShotgun(params, bHasNoOffset) {
	if (!Array.isArray(params) && IsAoETag(params, "MineTrigger", !bHasNoOffset)) return true;
	if (!Array.isArray(params) && IsAoETag(params, "ShotgunTrigger", bHasNoOffset)) return true;
	for (var p in params) {
		if (IsAoETag(params[p], "MineTrigger", !bHasNoOffset)) return true;
		if (IsAoETag(params[p], "ShotgunTrigger", bHasNoOffset)) return true;
	}
	return false;
}
function IsAoETag(params, tag, bHasNoOffset) {
	if (params.tag == tag && (params.data.damage > 0) && (HasNoOffset(params.data) == bHasNoOffset))
		return true;
	if (params.bonus != undefined && params.bonus.tag == (tag + "Bonus") && (params.bonus.data.damage > 0) && (HasNoOffset(params.bonus.data) == bHasNoOffset))
		return true;
	return false;
}
function IsTag(params, tag) {
	if (!Array.isArray(params) && params.tag == tag)
		return true;
	if (!Array.isArray(params) && params.bonus != undefined && params.bonus.tag == (tag + "Bonus"))
		return true;
	for (var p in params) {
		if (params[p].tag == tag)
			return true;
		if (params[p].bonus != undefined && params[p].bonus.tag == (tag + "Bonus"))
			return true;
	}
	return false;
}
function GetTag(params, tag) {
	let tempParams = []; if (!Array.isArray(params)) tempParams.push(params); else tempParams = params;
	for (var p in tempParams) {
		if (tempParams[p].tag == tag)
			return tempParams[p];
		if (tempParams[p].bonus != undefined && tempParams[p].bonus.tag == (tag + "Bonus"))
			return tempParams[p];
	}
	return null;
}
function IsMissile(params) {
	return IsTag(params, "SharkletTrigger");
}
function IsZap(params) {
	return IsTag(params, "ZapTrigger");
}
function IsPeriodic(params) {
	return IsTag(params, "PeriodicTriggerEffect");
}
function IsFire(params) {
	if (!Array.isArray(params) && IsFireParams(params))
		return true;
	for (var p in params) {
		if (IsFireParams(params[p]))
			return true;
	}
	return false;
}
function IsFireParams(params) {
	if (params.data != undefined) {
		if (params.data.statusEffects != undefined && IsFireEffects(params.data.statusEffects)) return true;
		if (params.data.bonus != undefined && params.data.bonus.data.statusEffects != undefined && IsFireEffects(params.data.bonus.data.statusEffects)) return true;
	}
	return false;
}
function IsFireEffects(effects) {
	for (let i = 0; i < effects.length; i++) {
		if (effects[i].tag == "BurningEffect") return true;
	}
	return false;
}
function IsDuration(effects, name) {
	// TODO clean up this garbo
	// TODO should i just recursively check for "duration" and "dematerialTime" keys?

	// i catch some pickups here but then do separate checks below...
	if (IsTempBooster(effects)) return true;
	//if(IsTag(effects, "StatBoostTrigger")) return true;

	if (IsTag(effects, "DematerializeTrigger")) return true;
	if (IsTag(effects, "HealOverTimeTrigger")) return true;
	if (IsTag(effects, "MineTrigger")) return true;
	if (IsTag(effects, "ExtraGunTrigger")) return true;
	if (IsTag(effects, "ExtraShieldTrigger")) return true;
	if (IsTag(effects, "GunProcTrigger")) return true;
	if (IsTag(effects, "LeapTrigger")) return true;

	let tempEffects = [];
	if (!Array.isArray(effects)) tempEffects.push(effects); else tempEffects = effects;
	//console.log(tempEffects.length, name);
	for (var e in tempEffects) {
		let effect = tempEffects[e];
		if (IsDurationEffectParams(effect)) return true;
		if (effect.tag == "TriggeredTriggerEffect" && effect.data.params.tag == "PickupPackTrigger")
			for (var t in effect.data.params.data.triggers) {
				var trigger = effect.data.params.data.triggers[t];
				if (IsDurationEffectParams(trigger)) return true;
				if (IsDuration(trigger)) return true;
			}
		if (effect.tag == "PeriodicTriggerEffect")
			for (var p in effect.data.params) {
				var params = effect.data.params[p];
				if (IsBoostingPack(params)) return true;
				if (IsDuration(params)) return true;
			}
	}
	return false;
}
function IsDoT(params) {
	if (!Array.isArray(params) && IsDoTParams(params))
		return true;
	for (var p in params) {
		if (IsDoTParams(params[p]))
			return true;
	}
	return false;
}
function IsDoTParams(params) {
	if (params.data != undefined) {
		if (params.data.statusEffects != undefined && IsDoTEffects(params.data.statusEffects)) return true;
		if (params.data.bonus != undefined && params.data.bonus.data.statusEffects != undefined && IsDoTEffects(params.data.bonus.data.statusEffects)) return true;
	}
	return false;
}
function IsDoTEffects(effects) {
	for (let i = 0; i < effects.length; i++) {
		if (effects[i].tag == "BurningEffect") return true;
		if (effects[i].tag == "DoTEffect") return true;
	}
	return false;
}
function IsDurationEffectParams(params) {
	if (params.data != undefined) {
		if (params.data.statusEffects != undefined && IsDurationEffects(params.data.statusEffects)) return true;
		if (params.data.bonus != undefined && params.data.bonus.data.statusEffects != undefined && IsDurationEffects(params.data.bonus.data.statusEffects)) return true;
	}
	return false;
}
function IsDurationEffects(effects) {
	for (let i = 0; i < effects.length; i++) {
		if (effects[i].data.duration != undefined) return true;
	}
	return false;
}
function IsFrost(params) {
	if (!Array.isArray(params) && IsFrostParams(params))
		return true;
	for (var p in params) {
		if (IsFrostParams(params[p]))
			return true;
	}
	return false;
}
function IsFrostParams(params) {
	if (params.data != undefined) {
		if (params.data.statusEffects != undefined && IsFrostEffects(params.data.statusEffects)) return true;
		if (params.data.bonus != undefined && params.data.bonus.data.statusEffects != undefined && IsFrostEffects(params.data.bonus.data.statusEffects)) return true;
	}
	return false;
}
function IsFrostEffects(effects) {
	for (let i = 0; i < effects.length; i++) {
		if (effects[i].tag == "ChillEffect") return true;
		if (effects[i].tag == "FreezeEffect") return true;
	}
	return false;
}
function HasNoOffset(data) {
	// no offset means it's MineTrigger in this case
	if (data.offset == undefined) return false;
	if (data.offset.x == 0 && data.offset.y == 0) return true;
	return false;
}