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
					addLine("New " + file, divList);
					divList.appendChild(MakeStatsTable(entity, file == "accolade" ? 0 : entity.tier));
				}
				else if (file == "object")
				{
					addLine("New " + file + ": <b>" + entity.name + "</b>", divList);
					//divList.appendChild(draw(entity, 0.4));
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
				CompareJSON(entity, entityPrev, "");
		}
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
function CompareJSON(entity, entityPrev, parent)
{
	for (let key in entity)
	{
		if(entityPrev[key] != undefined)
		{
			if(typeof entity[key] == 'object')
				CompareJSON(entity[key], entityPrev[key], parent + " " + (entity.name != undefined ? entity.name : "") + " " + key);
			else if(entity[key] != entityPrev[key])
			{
				var thing = entity.name != undefined ? entity.name : "";
				addLine(parent + " " + thing + "<br/>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;" + key + ": <b>" + entityPrev[key] + " &#8594; " + entity[key] + "</b>", divList);
			}
		}
	}
}
function ExistsPrev(file, name)
{
	var entity = GetPrevEntity(file, name);
	if(entity != null)
		return true;
	else
		return false;
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