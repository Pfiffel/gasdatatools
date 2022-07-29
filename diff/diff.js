var tableOutput = document.getElementById("tableOutput");
var datatypes = ["accolade","animation","champion","decor","emitter","explosion","gunbullet","item","lair","lane","map","monster","object","particle","region","soundpack","speaker","symbiote"]; // for utilGAS to load files, calls parseData once completed
var datatypesPrev = datatypes;
loadGasData();
var errorLogs = document.createElement('div');
tableOutput.appendChild(errorLogs);

function LogError(text)
{
    makeDiv(text, errorLogs);
}
function parseIDs() // make super duper recursive id checker?
{

}
var changedSymbs = {};
var changedObjects = {};
var changedMaps = {};
let divList = document.createElement('div');
function parseData()
{
	var h1List = document.createElement("h1");
	h1List.textContent = "Build " + BUILD + " Diff";
	divList.appendChild(h1List);
	var hNew = document.createElement("h2");
	hNew.textContent = "New";
	divList.appendChild(hNew);
	for (let f = 0; f < datatypes.length; f++)
	{
		let file = datatypes[f];
		for (let i = 0; i < gasData[file].length; i++)
		{
			let entity = gasData[file][i];
			let entityPrev = GetPrevEntity(file, entity.name);
			if(entityPrev == null){
				if(file == "symbiote" || file == "item" || file == "accolade")
				{
					var forChamp = (entity.champion != undefined) ? entity.champion + " " : "";
					addLine("New " + forChamp + file, divList);
					divList.appendChild(MakeStatsTable(entity, file == "accolade" ? 0 : entity.tier));
				}
				else if (file == "monster" || file == "gunbullet")
				{
					addLine("New " + file + ": <b>" + entity.name + "</b>", divList);
					let divSprite = document.createElement('div');
					divSprite.style.display = "table-cell";
					divSprite.style.verticalAlign = "middle";
					divSprite.appendChild(draw(entity, 0.4, false));
					divList.appendChild(divSprite);
				}
				else if (file == "object")
				{
					addLine("New " + file + ": <b>" + entity.name + "</b>", divList);
					changedObjects[entity.name] = true;
					// TODO make draw function for just objects
				}
				else
					addLine("New " + file + ": <b>" + entity.name + "</b>", divList);
			}
		}
	}
	var hChanged = document.createElement("h2");
	hChanged.textContent = "Changed";
	divList.appendChild(hChanged);
	for (let f = 0; f < datatypes.length; f++)
	{
		let file = datatypes[f];
		for (let i = 0; i < gasData[file].length; i++)
		{
			let entity = gasData[file][i];
			let entityPrev = GetPrevEntity(file, entity.name);
			if(entityPrev != null) 
				CompareJSON(entity, entityPrev, entity.name, file, "");
		}
	}
	for (let entity in changedSymbs)
	{
		divList.appendChild(MakeGraphicCompareBlock(entity + " changes",
		MakeStatsTable(GetPrevEntity("symbiote", entity), 0), 
		MakeStatsTable(GetNewEntity("symbiote", entity), 0)));
	}
	var entitySpriteChanged = FindObjectUsage(changedObjects);
	for (let entity in entitySpriteChanged)
	{
		var prevMonster = GetPrevEntity("monster", entity);
		if(prevMonster == undefined) continue;
		divList.appendChild(MakeGraphicCompareBlock(entity + " graphics",
			draw(prevMonster, 0.4, true), 
			draw(GetNewEntity("monster", entity), 0.4, false)));
	}
	for (let entity in changedMaps)
	{
		divList.appendChild(MakeGraphicCompareBlock(entity,
			DrawMap(entity, 0.01, true), 
			DrawMap(entity, 0.01, false)));
	}
	var hRemoved = document.createElement("h2");
	hRemoved.textContent = "Removed";
	divList.appendChild(hRemoved);
	for (let f = 0; f < datatypes.length; f++)
	{
		let file = datatypes[f];
		for (let i = 0; i < gasDataPrev[file].length; i++)
		{
			let entity = gasDataPrev[file][i];
			let entityNew = GetNewEntity(file, entity.name);
			if(entityNew == null){
					addLine("Removed " + file + ": <b>" + entity.name + "</b>", divList);
			}
		}
	}
	tableOutput.appendChild(divList);
}
function MakeGraphicCompareBlock(headerText, spritePrev, spriteNew)
{
	let div = document.createElement('div');
	let header = document.createElement('div');
	header.style.fontFamily = "monospace";
	header.innerHTML = headerText;
	div.appendChild(header);
	div.appendChild(MakeCanvasCompare(spritePrev, spriteNew));
	return div;
}
function MakeCanvasCompare(c1, c2)
{
	let divSpriteCompare = document.createElement('div');
	divSpriteCompare.style.display = "table";
	let divSpritePrev = document.createElement('div');
	let divSpriteNew = document.createElement('div');
	divSpritePrev.style.display = "table-cell";
	divSpritePrev.style.verticalAlign = "middle";
	divSpriteNew.style.display = "table-cell";
	divSpriteNew.style.verticalAlign = "middle";
	divSpritePrev.appendChild(c1);
	divSpriteNew.appendChild(c2);
	
	let divArrow = document.createElement('div');
	divArrow.style.fontFamily = "monospace";
	divArrow.style.display = "table-cell";
	divArrow.style.verticalAlign = "middle";
	divArrow.innerHTML = "&#160;&#8594;&#160;";

	divSpriteCompare.appendChild(divSpritePrev);
	divSpriteCompare.appendChild(divArrow);
	divSpriteCompare.appendChild(divSpriteNew);
	return divSpriteCompare;
}
function FindObjectUsage(list)
{
	var found = {};
	// cycle through all monsters for each changed object to find all usages, also check weapons because turrets
	// TODO also do this for player tanks and check if it needs to be done for other graphics
	for (let obj in list)
	{
		for (let i = 0; i < gasData["monster"].length; i++)
		{
			var monsterData = gasData["monster"][i];
			if(monsterData.objectType == obj) found[monsterData.name] = true;
			for (let w = 0; w < monsterData.weapons.length; w++)
			{
				var weapon = monsterData.weapons[w];
				if(weapon.objectType == obj) found[monsterData.name] = true;
			}
		}
	}
	return found;
}
function CompareJSON(entity, entityPrev, superParent, fileType, parentStringList)
{
	for (let key in entity)
	{
		if(entityPrev != undefined && entity[key] != "")
		{
			var name = entity.name != undefined ? entity.name : "";
			var header = parentStringList + " " + name;
			if(key == "consolationPrizes")
			{
				var a1 = entityPrev[key].toString();
				var a2 = entity[key].toString();
				if(a1 != a2) // lazy array compare
					MakeChangeEntry(header, key, a1, a2, divList);
			}
			else if(typeof entity[key] == 'object')
				CompareJSON(entity[key], entityPrev[key], superParent, fileType, header + " " + key);
			else if(entity[key] != entityPrev[key])
			{
				if(fileType == "object") {changedObjects[superParent] = true; continue;}
				if(fileType == "map" && (key == "x" || key == "y" || key == "tag" || key == "regionType")) {changedMaps[superParent] = true; continue;}
				if(fileType == "symbiote") {changedSymbs[superParent] = true; continue;}
				if(IsNewButDefaultValue(entityPrev, entity, key)) continue;
				MakeChangeEntry(header, key, entityPrev[key], entity[key], divList);
			}
		}
	}
}
function IsNewButDefaultValue(entityPrev, entity, key)
{
	// somewhat hacky, this is to make it not show new entries when they are just the default value, entry added my maker due to other changes
	if(entityPrev[key] == undefined)
		if(key == "maxMoveDistance" && entity[key] == 500) return true;
		else if(key == "runAnimationDuration" && entity[key] == 700) return true;
		else if(key == "halfArc" && entity[key] == 1800) return true;
		else if(key == "angleBetweenProjectiles" && entity[key] == 150) return true;
	return false;
}
function MakeChangeEntry(header, key, prev, curr, container)
{
	var div = document.createElement('div');
	div.classList.add("diffBlock");
	div.innerHTML = header + 
	"<div style='margin-left:8ch;display:grid;grid-template-columns:20ch 1fr'><span><u>" + key + "</u></span><b>" + prev + "</b>" + 
	"<span style='justify-self:end'>&#8594;&#160;</span><b>" + curr + "</b></div>";
	container.appendChild(div);
	return div;
}
function GetPrevEntity(file, name)
{
	// TODO optimize, should make a dictionary rather than iterating through everything every time
	for (let i = 0; i < gasDataPrev[file].length; i++)
	{
		var entity = gasDataPrev[file][i];
		if(entity != undefined && entity.name == name) return entity;
	}
	return null;
}
function GetNewEntity(file, name)
{
	// TODO optimize, should make a dictionary rather than iterating through everything every time
	for (let i = 0; i < gasData[file].length; i++)
	{
		var entity = gasData[file][i];
		if(entity != undefined && entity.name == name) return entity;
	}
	return null;
}