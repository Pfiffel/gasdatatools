class Monster {
	constructor(json) {
		this.data = json;
		this._name = json.name;
		this._hp = json.hp;
		this._xp = json.xp;
		this._bullets = {};
		this._shotguns = {};
		this._flamethrowers = {};
		this._mortars = {};
		this._mines = {};
		this._charges = {};
		this._minions = {};
	}
	getTier() {
		return parseInt(Math.sqrt(this._xp));
	}
	getDPS() {
		var dpsST = 0;
		var dpsMT = 0;
		for (let i = 0; i < this.data.weapons.length; i++) {
			var weapon = this.data.weapons[i];
			var cd = weapon.cooldown;
			dpsST += this.getDamage(weapon, weapon, true, false) * (1000 / cd);
			dpsMT += this.getDamage(weapon, weapon, false, false) * (1000 / cd);
		}
		return "<b>" + round(dpsST, 2) + (dpsST == dpsMT ? "" : "-" + round(dpsMT, 2)) + "</b> DPS";
	}
	getDamage(weapon, weaponRoot, singleTarget, compound) {
		var wD = compound ? weapon.data : weapon.params.data;
		var tag = compound ? weapon.tag : weapon.params.tag;

		var damageST = 0;
		var damageMT = 0;
		let bulletHash, aoeHash;
		switch (tag) {
			case "CompoundParams":
				for (let j = 0; j < wD.weapons.length; j++) {
					damageST += this.getDamage(wD.weapons[j], weapon, true, true) / wD.weapons.length;
					damageMT += this.getDamage(wD.weapons[j], weapon, false, true) / wD.weapons.length;
				}
				break;
			case "MultiBarrelGunParams":
				let bullet = getBullet(wD.gunBulletType);
				if (bullet == null) console.log("something went wrong with " + this._name + " " + tag);
				damageST = bullet.damage;
				if (weaponRoot.objectType == "") console.log(this._name + ": MultiBarrelGunParams expects valid object with attachment points");
				damageMT = getObject(weaponRoot.objectType).attachmentPoints.length * damageST;
				bulletHash = wD.gunBulletType + wD.range;
				this._bullets[bulletHash] = { "bullet": wD.gunBulletType, "range": wD.range };
				break;
			case "GunParams":
				let tempDmg = 0;
				for (let j = 0; j < wD.gunBulletTypes.length; j++) {
					let b = wD.gunBulletTypes[j];
					tempDmg += getBullet(b).damage;
					bulletHash = b + wD.range;
					this._bullets[bulletHash] = { "bullet": b, "range": wD.range };
				}
				damageST = tempDmg/wD.gunBulletTypes.length;
				damageMT = wD.numProjectiles * damageST;
				break;
			case "BarrageParams":
				for (let j = 0; j < wD.salvoes.length; j++) {
					damageST += getBullet(wD.gunBulletType).damage;
					damageMT += wD.numBullets * (wD.salvoes[j].mirror + 1) * damageST;
				}
				bulletHash = wD.gunBulletType + wD.range;
				this._bullets[bulletHash] = { "bullet": wD.gunBulletType, "range": wD.range };
				break;
			case "MortarBarrageParams":
				var total = 0;
				for (let j = 0; j < wD.salvoes.length; j++) {
					damageST += wD.damage;
					damageMT += wD.salvoes[j].bombCount * damageST;
					total += wD.salvoes[j].bombCount;
				}
				this._mortars[tag + wD.damage + wD.bombRadius] = { "damage": wD.damage, "radius": wD.bombRadius, "salvoes": total, "powers": wD.powers, "wD": wD };
				break;
			case "MortarParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._mortars[tag + wD.damage + wD.radius] = { "damage": wD.damage, "radius": wD.radius, "powers": wD.powers, "wD": wD };
				break;
			case "MinelayerParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._mines[tag + wD.damage + wD.radius] = { "damage": wD.damage, "radius": wD.radius, "powers": wD.powers, "wD": wD };
				break;
			case "ShotgunParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._shotguns[tag + wD.damage + wD.range + wD.halfArc] = { "damage": wD.damage, "range": wD.range, "halfArc": wD.halfArc, "powers": wD.powers, "wD": wD };
				break;
			case "ShotgunBarrageParams":
				for (let j = 0; j < wD.blastSeries.length; j++) {
					let newWD = wD.blastSeries[j].params;
					damageST += newWD.damage;
					var total = 0;
					for (let b = 0; b < wD.blastSeries[j].blasts.length; b++) {
						total += wD.blastSeries[j].blasts[b].mirror + 1;
					}
					damageMT += damageST * total;
					this._shotguns[tag + newWD.damage + newWD.range + newWD.halfArc] = { "damage": newWD.damage, "range": newWD.range, "halfArc": newWD.halfArc, "powers": newWD.powers, "wD": wD };
				}
				break;
			case "FlamethrowerParams":
				// TODO flamethrower damage and stuff
				damageST = wD.damage;
				damageMT = damageST;
				this._flamethrowers[tag + wD.range + wD.halfArc] = { "range": wD.range, "powers": wD.powers, "delay": wD.delay, "halfArc": wD.halfArc, "wD": wD };
				break;
			case "ChargeParams":
				this._charges[tag + wD.range + wD.extraRange + wD.speed] = { "range": wD.range, "extraRange": wD.extraRange, "speed": wD.speed, "wD": wD };
				break;
			case "MinionParams":
				/*for (let j = 0; j < wD.monsterNames.length; j++) {
					this._minions[wD.monsterNames[j]] = { "maxCount": wD.maxCount };
				}*/
				var minionList = wD.monsterNames.length != 1 ? "(" + wD.monsterNames.toString() + ")" : wD.monsterNames[0];
				this._minions[minionList] = { "maxCount": wD.maxCount };
				break;
			case "MinionBarrageParams":
				for (let j = 0; j < wD.salvoes.length; j++) {
					let salvo = wD.salvoes[j];
					this._minions[salvo.monsterName] = { "maxCount": salvo.count };
				}
				break;
			case "NullParams":
				break;
			default:
				console.log("yo, i don't know " + tag + " from " + this._name);
				break;
		}

		if (singleTarget)
			return damageST;
		else
			return damageMT;
	}
	getMinions() {
		var minions = [];
		for (let i = 0; i < this.data.weapons.length; i++) {
			var weapon = this.data.weapons[i];
			if (weapon.params.tag == "MinionParams") {
				// TODO, parse list instead
				var name = weapon.params.data.monsterNames.toString();
				var minionHp = getMonster(name)._hp; // oh dear
				var policy = weapon.params.data.movement != undefined ? weapon.params.data.movement.data.playerPolicy : undefined;
				var radius = weapon.params.data.movement != undefined ? weapon.params.data.movement.data.radius : undefined;
				minions.push({
					maxCount: weapon.params.data.maxCount, monsterName: name,
					playerPolicy: policy, radius: radius, hp: minionHp
				})
			}
		}
		return minions;
	}
	outputSimple() {
		let div = document.createElement('div');
		div.classList.add("inline");
		var divSprite = document.createElement('div');
		divSprite.appendChild(draw(this.data, SCALE_SMALL));
		div.appendChild(divSprite);
		return div;
	}
	outputGFX(bRow, scale = SCALE_STANDARD, bDrawRadius = false, bDrawShield = false, bShowSounds = false) {
		let div = document.createElement('div');
		div.classList.add("inline");
		var divSprite = document.createElement('div');
		divSprite.appendChild(draw(this.data, scale, false, bDrawRadius, bDrawShield));
		let span = document.createElement('span');
		span.innerHTML = this._name;
		divSprite.appendChild(span)
		var divAttacks = document.createElement('div');
		this.getDPS(); // just to populate attacks
		for (let bullet in this._bullets) {
			var jsonBullet = getBullet(this._bullets[bullet].bullet);
			let spriteDiv = document.createElement('div');
			spriteDiv.classList.add("inline");
			spriteDiv.appendChild(draw(jsonBullet, scale));
			divAttacks.appendChild(spriteDiv);
		}
		div.appendChild(divSprite);
		div.appendChild(divAttacks);
		return div;
	}
	output(bRow, scale = SCALE_STANDARD, bDrawRadius = false, bDrawShield = false, bShowSounds = false) {
		let div = document.createElement('div');
		div.classList.add("inline");
		let divInfo = document.createElement('div');
		//divInfo.classList.add("inline");
		var divSprite = document.createElement('div');
		divSprite.appendChild(draw(this.data, scale, false, bDrawRadius, bDrawShield));
		if (bRow) {
			divSprite.classList.add("infoBlockRow");
			divSprite.style.width = "75px";
		}
		else divSprite.classList.add("infoBlock");

		div.appendChild(divSprite);
		var divBasicInfo = document.createElement('div');
		if (bRow) {
			divBasicInfo.classList.add("infoBlockRow");
			divBasicInfo.style.width = "140px";
		}
		else divBasicInfo.classList.add("infoBlockColumn");
		divBasicInfo.innerHTML = this.printBasic();

		divInfo.appendChild(divBasicInfo);
		var sReward = this.printRewards();
		if (sReward != "") {
			var divRewardInfo = document.createElement('div');
			if (bRow) {
				divRewardInfo.classList.add("infoBlockRow");
				divRewardInfo.style.width = "140px";
			}
			else divRewardInfo.classList.add("infoBlockColumn");
			divRewardInfo.innerHTML = sReward + "<br/>" + this.outputLoot();

			divInfo.appendChild(divRewardInfo);
		}
		var divAttacks = document.createElement('div');
		if (bShowSounds) {
			this.parseSoundPack(divAttacks, "On Hit", this.data.onDamageSoundPack, "Enemy Hits");
			this.parseSoundPack(divAttacks, "Death", this.data.deathCrySoundPack);
		}
		try {
			divAttacks.appendChild(this.outputAttacks(scale, bShowSounds));
		}
		catch (e) {
			console.log("problem with attacks from " + this._name + ": " + e)
		}
		//divAttacks.style.width = "150px";
		divInfo.appendChild(divAttacks);
		div.appendChild(divInfo);
		return div;
	}
	parseSoundPack(container, label, packName, fallback = undefined) {
		if (packName == undefined || packName == "") packName = fallback;
		if (packName != undefined) {
			var pack = getSoundPack(packName);
			var sound = pack.sounds[0];
			makeAudio(container, label, '../../client/sound/' + sound + ".ogg", pack.volume);
		}
	}
	parseSound(container, label, soundName, soundVolume) {
		if (soundName != undefined && soundName != "") {
			makeAudio(container, label, '../../client/sound/' + soundName + ".ogg", soundVolume);
		}
	}
	convertPowersToString(powers) {
		if (powers == undefined) return "";
		var s = "";
		for (let p in powers) {
			var power = powers[p];
			s += " | ";
			if (power.tag == "SizzlePower") {
				s += power.data.dps + " dps";
			}
			else if (power.tag == "DisablePower") {
				var aDisabled = [];
				if (power.data.engines) aDisabled.push("engines");
				if (power.data.guns) aDisabled.push("guns");
				if (power.data.health) aDisabled.push("health regen");
				if (power.data.mana) aDisabled.push("mana regen");
				if (power.data.rotation) aDisabled.push("rotation");
				if (power.data.scoot) aDisabled.push("scoot");
				if (power.data.shield) aDisabled.push("shield");
				if (power.data.triggers) aDisabled.push("triggers");
				var duration = " " + round(power.data.duration / 1000, 2) + "s";
				var cap = (power.data.caption != undefined && power.data.caption != "") ? power.data.caption : power.tag;
				s += cap + " (disables " + aDisabled.toString() + ") " + duration;
			}
			else if (power.data.duration != undefined) {
				var damage = (power.data.damage != undefined) ? " <b>" + power.data.damage + "</b>" : "";
				var duration = " " + round(power.data.duration / 1000, 2) + "s";
				var cap = (power.data.caption != undefined && power.data.caption != "") ? power.data.caption : power.tag;
				s += cap + damage + duration;
			}
			else
				s += power.tag;
		}
		return "<span class=\"power\">" + s + "</span>";
	}
	damageInfo(damage) {
		let min = parseInt(damage * (1 - 0.75));
		let armorInfo = "(min <b>" + min + "</b>, " + (damage-min) + " armor) ";
		return damage == 0 ? "" : ("<b>" + damage + "</b> damage " + armorInfo);
	}
	outputAttacks(scale = SCALE_STANDARD, bShowSounds = false) {
		this.getDPS(); // just to populate attacks
		let div = document.createElement('div');
		div.classList.add("inline");
		//console.log(this.data.weapons.length + " " + this._name)
		if (this.data.weapons.length == 1 && this.data.weapons[0].params.tag == "CompoundParams") {
			addLine("Compound Cooldown: <b>" + this.data.weapons[0].cooldown + "</b>", div);
		}
		for (let bullet in this._bullets) {
			var jsonBullet = getBullet(this._bullets[bullet].bullet);
			let attackDiv = document.createElement('div');
			let spriteDiv = document.createElement('div');
			spriteDiv.classList.add("inline");
			spriteDiv.appendChild(draw(jsonBullet, scale));
			let infoDiv = document.createElement('div');
			infoDiv.classList.add("inline");
			infoDiv.innerHTML = this.damageInfo(jsonBullet.damage) +
				"<b>" + jsonBullet.speed + "</b> speed " +
				"<b>" + this._bullets[bullet].range + "</b> range" + this.convertPowersToString(jsonBullet.powers);
			attackDiv.appendChild(spriteDiv);
			attackDiv.appendChild(infoDiv);
			if (bShowSounds) {
				this.parseSoundPack(attackDiv, "Bullet", jsonBullet.soundPack);
			}
			div.appendChild(attackDiv);
		}
		for (let shotgun in this._shotguns) {
			let letCurrentData = this._shotguns[shotgun];
			let attackDiv = document.createElement('div');
			var powers = this.convertPowersToString(letCurrentData.powers);
			attackDiv.innerHTML = "Shotgun: " + this.damageInfo(letCurrentData.damage) + ", " + GetArc(letCurrentData.halfArc) + ", <b>" + letCurrentData.range + "</b> range" + powers;
			if (bShowSounds) {
				// TODO lol hack, just attached the whole data object (wD) to these
				this.parseSound(attackDiv, "Telegraph", letCurrentData.wD.triggerSound, letCurrentData.wD.triggerVolume)
				var explosion = getExplosion(letCurrentData.wD.explosionType);
				if (explosion != undefined) this.parseSound(attackDiv, "Explosion", explosion.sound, explosion.volume)
			}
			div.appendChild(attackDiv);
		}
		for (let flamethrower in this._flamethrowers) {
			let attackDiv = document.createElement('div');
			var powers = this.convertPowersToString(this._flamethrowers[flamethrower].powers);
			attackDiv.innerHTML = "Flamethrower: <b>" + this._flamethrowers[flamethrower].delay + "</b> delay, " +
				GetArc(this._flamethrowers[flamethrower].halfArc) + ", " + "<br/>" +
				"<b>" + this._flamethrowers[flamethrower].range + "</b> range" + powers;
			div.appendChild(attackDiv);
		}
		for (let mortar in this._mortars) {
			let letCurrentData = this._mortars[mortar];
			let attackDiv = document.createElement('div');
			var num = letCurrentData.salvoes;
			attackDiv.innerHTML = (num != undefined ? num + " Mortars" : "Mortar") + ": " + this.damageInfo(letCurrentData.damage) + ", <b>" + letCurrentData.radius + "</b> radius" + this.convertPowersToString(letCurrentData.powers);
			if (bShowSounds) {
				// TODO lol hack, just attached the whole data object (wD) to these
				this.parseSound(attackDiv, "Launch", letCurrentData.wD.shootSound, letCurrentData.wD.shootVolume)
				var explosion = getExplosion(letCurrentData.wD.explosionType);
				if (explosion != undefined) this.parseSound(attackDiv, "Explosion", explosion.sound, explosion.volume)
			}
			div.appendChild(attackDiv);
		}
		for (let mine in this._mines) {
			let attackDiv = document.createElement('div');
			let dmg = this._mines[mine].damage;
			attackDiv.innerHTML = "Mine: " + this.damageInfo(dmg) + "<b>" + this._mines[mine].radius + "</b> radius" + this.convertPowersToString(this._mines[mine].powers);
			div.appendChild(attackDiv);
		}
		for (let charge in this._charges) {
			let attackDiv = document.createElement('div');
			attackDiv.innerHTML = "Charge: <b>" + this._charges[charge].range + "</b> range (+" + this._charges[charge].extraRange + "), <b>" + this._charges[charge].speed + "</b> speed";
			div.appendChild(attackDiv);
		}
		let minionList = "";
		for (let minion in this._minions) {
			if (minionList != "") minionList += ", ";

			minionList += this._minions[minion].maxCount + "x <b>" + minion + "</b>";
		}
		if (minionList != "") {
			let extraDiv = document.createElement('div');
			extraDiv.innerHTML = "Spawns Minions: " + minionList;
			div.appendChild(extraDiv);
		}
		for (var sh in this.data.shields) {
			var shield = this.data.shields[sh];
			let attackDiv = document.createElement('div');
			attackDiv.innerHTML = "Shield: " + GetArc(shield.halfArc) + ", <b>" + shield.percentProtection + "%</b> damage reduction";
			div.appendChild(attackDiv);
		}
		if (this.data.burrowDetectRange > 0) {
			let extraDiv = document.createElement('div');
			extraDiv.innerHTML = "Burrows: <b>" + this.data.burrowDetectRange + "</b> detection range";
			div.appendChild(extraDiv);
		}
		if (this.data.successorMonster != "") {
			let extraDiv = document.createElement('div');
			extraDiv.innerHTML = "Succeeded by: <b>" + this.data.successorMonster + "</b>";
			div.appendChild(extraDiv);
		}
		return div;
	}
	outputLoot() {
		var listLoot = "";
		for (let itemPackIndex in this.data.itemPackDrops) {
			let itemPack = this.data.itemPackDrops[itemPackIndex];
			listLoot += this.GetItemPackList(itemPack.itemPack, itemPack.micros);
		}
		var listConsolation = "";
		let itemPack = this.data.consolationItemPack;
		if (itemPack != undefined && itemPack != "") {
			listConsolation += this.GetItemPackList(itemPack);
		}
		return (listLoot != "" ? "Loot: " + listLoot : listLoot) + "<br/>" + (listConsolation != "" ? "Consolation: " + listConsolation : listConsolation);
	}
	GetItemPackList(itemPackName, micros = -1) {
		var list = "";
		let itemPackData = getItemPack(itemPackName);
		let perc = micros != -1 ? " <b>" + (micros / 10000) + "%</b>" : "";
		list += "<br/>" + itemPackName + perc + ": ";
		for (let itemIndex in itemPackData.items) {
			if (itemIndex != 0) list += ", ";
			let itemName = itemPackData.items[itemIndex];
			let mainData = getItem(itemName);
			if (mainData == undefined) continue;
			let tier = mainData.credits;
			list += "<b>" + colorWrap(mainData.name, GetTierColor(tier)) + "</b>";
		}
		return list;
	}
	printBasic(hpMult = 1) {
		var move = Boolean(this.data.pauseBetweenMovements) ? "<b>" + this.data.runSpeed + "</b> spd <b>" + this.data.pauseBetweenMovements + "</b> pause " : "<b>" + this.data.runSpeed + "</b> spd";
		var heal = (this.data.healRate != 0) ? "<b>" + this.data.healRate + "</b> heal " : "";
		var hull = "<span class=\"hull\"><b>" + parseInt(this._hp * hpMult) + "</b> HP " + heal + "</span>";

		return this._name + " - T<b>" + this.getTier() + "</b>" + "<br/>" +
			hull + "<b>" + this._xp + "</b> XP " + "<br/>" +
			move + " <b>" + this.data.collisionRadius + "</b> rad";// - " + this.getDPS();
	}
	printRewards() {
		// TODO maybe use isSymbioteDropper(monster) here
		var givesXP = Boolean(this._xp);
		var hasGlobalDrops = !(this.data.itemPackDrops != undefined && this.data.itemPackDrops.length > 0) && givesXP;
		var t = this.getTier() - 2;
		var dropsSymbiote = (t > 0 && t <= 6) && hasGlobalDrops;
		if (!dropsSymbiote && !givesXP && !hasGlobalDrops) return "";
		var xpphp = round(this._xp / (this._hp / 100), 2);
		var symbDrop = dropsSymbiote ? "<br>Drops " + colorWrap("<b>" + TIER_NAMES[t] + "</b> Symbiote", GetTierColor(t)) : "";
		return "<b>" + xpphp + "</b> XP per 100 HP" + symbDrop;
	}
}