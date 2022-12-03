class Monster
{
	constructor(json)
	{
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
	}
	getTier(){
		return parseInt(Math.sqrt(this._xp));
	}
	getDPS() {
		var dpsST = 0;
		var dpsMT = 0;
		for (let i = 0; i < this.data.weapons.length; i++)
		{
			var weapon = this.data.weapons[i];
			var cd = weapon.cooldown;
			dpsST += this.getDamage(weapon, weapon, true, false)*(1000/cd);
			dpsMT += this.getDamage(weapon, weapon, false, false)*(1000/cd);
		}
		return "<b>" + round(dpsST, 2) + (dpsST == dpsMT ? "" : "-" + round(dpsMT, 2)) + "</b> DPS";
	}
	getDamage(weapon, weaponRoot, singleTarget, compound) {
		var wD = compound ? weapon.data : weapon.params.data;
		var tag = compound ? weapon.tag : weapon.params.tag;
		
		var damageST = 0;
		var damageMT = 0;
		let bulletHash, aoeHash;
		switch(tag)
		{
			case "CompoundParams":
				for (let j = 0; j < wD.weapons.length; j++)
				{
					damageST += this.getDamage(wD.weapons[j], weapon, true, true)/wD.weapons.length;
					damageMT += this.getDamage(wD.weapons[j], weapon, false, true)/wD.weapons.length;
				}
				break;
			case "MultiBarrelGunParams":
				let bullet = getBullet(wD.gunBulletType);
				if(bullet == null) console.log("something went wrong with " + this._name + " " + tag);
				damageST = bullet.damage;
				if(weaponRoot.objectType == "") console.log(this._name + ": MultiBarrelGunParams expects valid object with attachment points");
				damageMT = getObject(weaponRoot.objectType).attachmentPoints.length * damageST;
				bulletHash = wD.gunBulletType+wD.range;
				this._bullets[bulletHash] = {"bullet": wD.gunBulletType, "range": wD.range};
				break;
			case "GunParams":
				damageST = getBullet(wD.gunBulletType).damage;
				damageMT = wD.numProjectiles * damageST;
				bulletHash = wD.gunBulletType+wD.range;
				this._bullets[bulletHash] = {"bullet": wD.gunBulletType, "range": wD.range};
				break;
			case "BarrageParams":
				for (let j = 0; j < wD.salvoes.length; j++)
				{
					damageST += getBullet(wD.gunBulletType).damage;
					damageMT += wD.numBullets * (wD.salvoes[j].mirror+1) * damageST;
				}
				bulletHash = wD.gunBulletType+wD.range;
				this._bullets[bulletHash] = {"bullet": wD.gunBulletType, "range": wD.range};
				break;
			case "MortarBarrageParams":
                var total = 0;
				for (let j = 0; j < wD.salvoes.length; j++)
				{
					damageST += wD.damage;
					damageMT += wD.salvoes[j].bombCount * damageST;
                    total += wD.salvoes[j].bombCount;
				}
				this._mortars[tag+wD.damage+wD.bombRadius] = {"damage": wD.damage, "radius": wD.bombRadius, "salvoes": total};
				break;
			case "MortarParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._mortars[tag+wD.damage+wD.radius] = {"damage": wD.damage, "radius": wD.radius, "powers": wD.powers};
				break;
			case "MinelayerParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._mines[tag+wD.damage+wD.radius] = {"damage": wD.damage, "radius": wD.radius, "powers": wD.powers};
				break;
			case "ShotgunParams":
				damageST = wD.damage;
				damageMT = damageST;
				this._shotguns[tag+wD.damage+wD.range] = {"damage": wD.damage, "range": wD.range, "powers": wD.powers};
				break;
			case "FlamethrowerParams":
				// TODO flamethrower damage and stuff
				damageST = wD.damage;
				damageMT = damageST;
				this._flamethrowers[tag+wD.range+wD.halfArc] = {"range": wD.range, "powers": wD.powers, "delay": wD.delay, "halfArc": wD.halfArc};
				break;
			case "ChargeParams":
				this._charges[tag+wD.range+wD.extraRange+wD.speed] = {"range": wD.range, "extraRange": wD.extraRange, "speed": wD.speed};
			case "MinionParams":
			case "NullParams":
				break;
			default:
				console.log("yo, i don't know " + tag + " from " + this._name);
				break;
		}
		
		if(singleTarget)
			return damageST;
		else
			return damageMT;
	}
	getMinions()
	{
		var minions = [];
		for (let i = 0; i < this.data.weapons.length; i++)
		{
			var weapon = this.data.weapons[i];
			if(weapon.params.tag == "MinionParams")
			{
                var name = weapon.params.data.monsterName;
                var minionHp = getMonster(name)._hp; // oh dear
                var policy = weapon.params.data.movement != undefined ? weapon.params.data.movement.data.playerPolicy : undefined;
                var radius = weapon.params.data.movement != undefined ? weapon.params.data.movement.data.radius : undefined;
				minions.push({maxCount:weapon.params.data.maxCount, monsterName:name, 
                    playerPolicy:policy, radius:radius, hp:minionHp})
			}
		}
		return minions;
	}
	
	output(bRow, scale = SCALE_STANDARD, bDrawRadius = false, bDrawShield = false) {
		let div = document.createElement('div');
		div.classList.add("inline");
		let divInfo = document.createElement('div');
		divInfo.classList.add("inline");
		var divSprite = document.createElement('div');
		divSprite.appendChild(draw(this.data, scale, false, bDrawRadius, bDrawShield));
		if(bRow) {
			divSprite.classList.add("infoBlockRow");
			divSprite.style.width = "75px";
		}
			else divSprite.classList.add("infoBlock");
		
		div.appendChild(divSprite);
		var divBasicInfo = document.createElement('div');
		if(bRow) {
			divBasicInfo.classList.add("infoBlockRow");
			divBasicInfo.style.width = "140px";
		}
			else divBasicInfo.classList.add("infoBlockColumn");
		divBasicInfo.innerHTML = this.printBasic();
		
		divInfo.appendChild(divBasicInfo);
		var sReward = this.printRewards();
		if(sReward != "") 
		{
			var divRewardInfo = document.createElement('div');
			if(bRow) {
				divRewardInfo.classList.add("infoBlockRow");
				divRewardInfo.style.width = "140px";
			}
				else divRewardInfo.classList.add("infoBlockColumn");
			divRewardInfo.innerHTML = sReward + "<br/>" + this.outputLoot();
			
			divInfo.appendChild(divRewardInfo);
		}
		var divAttacks = this.outputAttacks(scale);
	//	var divLoot = this.outputLoot();
		//divAttacks.style.width = "150px";
		divInfo.appendChild(divAttacks);
	//	divInfo.appendChild(divLoot);
		div.appendChild(divInfo);
		return div;
	}
    convertPowersToString(powers)
    {
        if(powers == undefined) return "";
        var s = "";
        for (let p in powers){
			var power = powers[p];
            s += " | ";
						if(power.tag == "SizzlePower"){
							s += power.data.dps + " dps";
						}
            else if(power.data.duration != undefined){
                var damage = (power.data.damage != undefined) ? " <b>" + power.data.damage + "</b>" : "";
                var duration = " " + round(power.data.duration/1000, 2) + "s";
                var cap = power.data.caption != undefined ? power.data.caption : power.tag;
                s += cap + damage + duration;
            }
            else 
                s += power.tag;
		}
        return "<span class=\"power\">" + s + "</span>";
    }
	outputAttacks(scale = SCALE_STANDARD)
	{
		this.getDPS(); // just to populate attacks
		let div = document.createElement('div');
		div.classList.add("inline");
        //console.log(this.data.weapons.length + " " + this._name)
        if(this.data.weapons.length == 1 && this.data.weapons[0].params.tag == "CompoundParams")
        {
            addLine("Compound Cooldown: <b>" + this.data.weapons[0].cooldown + "</b>", div);
        }
		for (let bullet in this._bullets){
			var jsonBullet = getBullet(this._bullets[bullet].bullet);
			let attackDiv = document.createElement('div');
			let spriteDiv = document.createElement('div');
			spriteDiv.classList.add("inline");
			spriteDiv.appendChild(draw(jsonBullet, scale));
			let infoDiv = document.createElement('div');
			infoDiv.classList.add("inline");
			infoDiv.innerHTML = "<b>" + jsonBullet.damage + "</b> damage " + 
                                "<b>" + jsonBullet.speed + "</b> speed " + 
                                "<b>" + this._bullets[bullet].range + "</b> range" + this.convertPowersToString(jsonBullet.powers);
			attackDiv.appendChild(spriteDiv);
			attackDiv.appendChild(infoDiv);
			div.appendChild(attackDiv);
		}
		for (let shotgun in this._shotguns){
			let attackDiv = document.createElement('div');
            var powers = this.convertPowersToString(this._shotguns[shotgun].powers);
			attackDiv.innerHTML = "Shotgun: <b>" + this._shotguns[shotgun].damage + "</b> damage, <b>" + this._shotguns[shotgun].range + "</b> range" + powers;
			div.appendChild(attackDiv);
		}
		for (let flamethrower in this._flamethrowers){
			let attackDiv = document.createElement('div');
            var powers = this.convertPowersToString(this._flamethrowers[flamethrower].powers);
			attackDiv.innerHTML = "Flamethrower: <b>" + this._flamethrowers[flamethrower].delay + "</b> delay, " + 
			"<b>" + this._flamethrowers[flamethrower].halfArc + "</b> halfArc, " + "<br/>" + 
			"<b>" + this._flamethrowers[flamethrower].range + "</b> range" + powers;
			div.appendChild(attackDiv);
		}
		for (let mortar in this._mortars){
			let attackDiv = document.createElement('div');
            var num = this._mortars[mortar].salvoes;
			attackDiv.innerHTML = (num != undefined ? num + " Mortars" : "Mortar") + ": <b>" + this._mortars[mortar].damage + "</b> damage, <b>" + this._mortars[mortar].radius + "</b> radius" + this.convertPowersToString(this._mortars[mortar].powers);
			div.appendChild(attackDiv);
		}
		for (let mine in this._mines){
			let attackDiv = document.createElement('div');
			let dmg = this._mines[mine].damage;
			attackDiv.innerHTML = "Mine: " + (dmg != 0 ? "<b>" + dmg + "</b> damage, " : "") + "<b>" + this._mines[mine].radius + "</b> radius" + this.convertPowersToString(this._mines[mine].powers);
			div.appendChild(attackDiv);
		}
		for (let charge in this._charges){
			let attackDiv = document.createElement('div');
			attackDiv.innerHTML = "Charge: <b>" + this._charges[charge].range + "</b> range (+" + this._charges[charge].extraRange + "), <b>" + this._charges[charge].speed + "</b> speed";
			div.appendChild(attackDiv);
		}
		for (var sh in this.data.shields){
			var shield = this.data.shields[sh];
			let attackDiv = document.createElement('div');
			attackDiv.innerHTML = "Shield: <b>" + shield.percentProtection + "%</b> damage reduction";
			div.appendChild(attackDiv);
		}
		if(this.data.burrowDetectRange > 0)
		{
			let extraDiv = document.createElement('div');
			extraDiv.innerHTML = "Burrows: <b>" + this.data.burrowDetectRange + "</b> detection range";
			div.appendChild(extraDiv);
		}
		return div;
	}
	outputLoot()
	{
		var listLoot = "";
		for (let drop in this.data.drops){
			var item = this.data.drops[drop];
			let mainData = getItem(item.itemType);
			if(mainData == undefined) continue;
			var tier = mainData.credits;
			listLoot += "<b>" + colorWrap(mainData.name, TIER_COLORS[tier])  + "</b> " + (item.micros/10000)+ "%, ";
		}
		var listConsolation = "";
		for (let i in this.data.consolationPrizes){
			let mainData = getItem(this.data.consolationPrizes[i]);
			if(mainData == undefined) continue;
			var tier = mainData.credits;
			listConsolation += "<b>" + colorWrap(mainData.name, TIER_COLORS[tier])  + "</b>, ";
		}
		return (listLoot != "" ? "Loot: " + listLoot : listLoot) + "<br/>" + (listConsolation != "" ? "Consolation: " + listConsolation : listConsolation);
	}
	printBasic() {
        var move = Boolean(this.data.pauseBetweenMovements) ? "<b>" + this.data.runSpeed + "</b> spd <b>" + this.data.pauseBetweenMovements + "</b> pause " : "<b>" + this.data.runSpeed + "</b> spd";
		var heal = (this.data.healRate != 0) ? "<b>" + this.data.healRate + "</b> heal ": "";
        var hull = "<span class=\"hull\"><b>" + this._hp + "</b> HP " + heal + "</span>" ;
        
        return this._name + " - T<b>" + this.getTier() + "</b>" + "<br/>" +
        hull + "<b>" + this._xp + "</b> XP " + "<br/>" + 
        move + " <b>" + this.data.collisionRadius + "</b> rad";// - " + this.getDPS();
	}
	printRewards() {
		// TODO maybe use isSymbioteDropper(monster) here
		var givesXP = Boolean(this._xp);
		var hasGlobalDrops = !Boolean(this.data.drops.length) && givesXP;
		var t = this.getTier()-2;
		var dropsSymbiote = (t > 0 && t <= 6) && hasGlobalDrops;
		if(!dropsSymbiote && !givesXP && !hasGlobalDrops) return "";
		var xpphp = round(this._xp/(this._hp/100), 2);
		var symbDrop = dropsSymbiote ? "<br>Drops " + colorWrap("<b>"+TIER_NAMES[t]+"</b> Symbiote", TIER_COLORS[t]) : "";
		return "<b>"+xpphp+"</b> XP per 100 HP" + symbDrop;
	}
}