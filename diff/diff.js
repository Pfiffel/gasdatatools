var tableOutput = document.getElementById("tableOutput");
var datatypes = ["animation","base","champion","decor","emitter","explosion","gunbullet","item","lair","lane","map","monster","object","particle","region","soundpack","speaker","symbiote"]; // for utilGAS to load files, calls parseData once completed
var datatypesF = ["animation","base","champion","decor","emitter","explosion","gunbullet","item","lair","lane","map","monster","object","particle","region","soundpack","speaker","symbiote"];
loadGasData();
console.log("loading");
var errorLogs = document.createElement('div');
tableOutput.appendChild(errorLogs);

function LogError(text)
{
    makeDiv(text, errorLogs);
}
function parseIDs() // make super duper recursive id checker?
{

}

function parseData()
{
    console.log("diffing");
	let divList = document.createElement('div');
	var h1List = document.createElement("h1");
	h1List.textContent = "Diff";
	divList.appendChild(h1List);
	for (let f = 0; f < datatypes.length; f++)
	{
		var file = datatypes[f];
        for (let i = 0; i < gasData[file].length; i++)
        {
            entity = gasData[file][i];
            if(!exists(file, entity.name)) addLine(i+"NEW "+file+": " + entity.name, divList);
        }
	}
	tableOutput.appendChild(divList);
}
// TODO optimize lol
function exists(file, name)
{console.log(file + ": " + gasDataF[file].length)
    for (let i = 0; i < gasDataF[file].length; i++)
    {
        entity = gasDataF[file][i];
        if(entity != undefined && entity.name == name) return true;
    }
    return false;
}