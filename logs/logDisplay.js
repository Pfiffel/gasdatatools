
var tableOutput = document.getElementById("tableOutput");
var timeStart = window.performance.now();
var bench = document.createElement('div');
bench.innerHTML = "Loading...";
tableOutput.appendChild(bench);

var logData = [];
additionalFileLoaded = false;
loadJsonFile("PfiffelLog.log", function(loadedData){
	additionalFileLoaded = true;
	logData = JSON.parse(loadedData);
	if(allLoaded()) parseData();
});
var datatypes = ["map","lair","region","lane"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

HEATMAP_SIZE = 600;

var tags = {};
var retirements = {};
var deaths = {};
var players = {};
var removedSymbs = {};
var triggerStats = {};
var dateStart = undefined;
var dateEnd = undefined;
var graphIntervalDataPlayers = {};
var graphIntervalDataDeaths = {};
var deathPointsAll = [];
var deathPoints20 = [];
var deathPointsSub20 = [];
var movePoints = [];
var triggerPoints = [];
//var activePlayers = {};
function parseData()
{
	var secs = Math.round(window.performance.now() - timeStart)/1000;
	timeStart = window.performance.now();
	bench.innerHTML = "data loaded in " + secs + " seconds";
	//if(window.performance != undefined) var t0 = window.performance.now();
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	for (let i = 0; i < logData.length; i++)
	{
		var unix = logData[i].unixTime;
		var toInterval = parseInt(unix/GRAPH_INTERVAL);
		if(graphIntervalDataPlayers[toInterval] == undefined) graphIntervalDataPlayers[toInterval] = 0;
		if(graphIntervalDataDeaths[toInterval] == undefined) graphIntervalDataDeaths[toInterval] = 0;

		let currentTag = logData[i].message.tag;
		if(dateStart == undefined) dateStart = unix;
		if(i == logData.length-1) dateEnd = unix;
		if(currentTag == "RetirementLog")
		{
			var retiredChamp = logData[i].message.data.champion;
			if(retirements[retiredChamp] == undefined) retirements[retiredChamp] = [0,0];
			retirements[retiredChamp][0]++;
			retirements[retiredChamp][1] += logData[i].message.data.credits;
		}
		else if(currentTag == "PlayerDeathLog")
		{
			var diedChamp = logData[i].message.data.champion;
			if(deaths[diedChamp] == undefined) deaths[diedChamp] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
			var level = players[logData[i].message.data.name].currentLevel; //logData[i].message.data.level;
			deaths[diedChamp][level]++;
			deathPointsAll.push(MakePoint(logData[i].message.data.p));
			if(level == 20) deathPoints20.push(MakePoint(logData[i].message.data.p));
			if(level < 20) deathPointsSub20.push(MakePoint(logData[i].message.data.p));

			if(graphIntervalDataDeaths[toInterval] == undefined) graphIntervalDataDeaths[toInterval] = 0;
			graphIntervalDataDeaths[toInterval]++;
			
		}
		else if(currentTag == "PlayerStatusLog")
		{
			for (var playerIter in logData[i].message.data.players)
			{
				var player = logData[i].message.data.players[playerIter];
				var name = player.name;
				InitPlayerIfNotSeenYet(name);
				if(player.fps != 0) players[name].fpsLog.push(player.fps);
				if(player.latency != 0) players[name].latLog.push(player.latency);
				movePoints.push(MakePoint(player.p));
			}
			var playerAmount = logData[i].message.data.players.length;
			graphIntervalDataPlayers[toInterval] = Math.max(graphIntervalDataPlayers[toInterval], playerAmount);
		}
		else if(currentTag == "PlayerSpawnLog")
		{
			InitPlayerIfNotSeenYet(logData[i].message.data.name);
			players[logData[i].message.data.name].currentLevel = logData[i].message.data.level;
		}
		else if(currentTag == "LevelUpLog")
		{
			players[logData[i].message.data.name].currentLevel = logData[i].message.data.level+1;
		}
		else if(currentTag == "PlayerLoginLog")
		{
			InitPlayerIfNotSeenYet(logData[i].message.data.name);
			graphIntervalDataPlayers[toInterval]++;
		}
		else if(currentTag == "PlayerDisconnectLog")
		{
			graphIntervalDataPlayers[toInterval]--;
		}
		else if(currentTag == "SymbioteRemoveLog")
		{
			var removedSymb = logData[i].message.data.symbiote;
			if(removedSymbs[removedSymb] == undefined) removedSymbs[removedSymb] = 0;
			removedSymbs[removedSymb]++;
		}
		else if(currentTag == "TriggerLog")
		{
			var triggerChamp = logData[i].message.data.champion;
			if(triggerStats[triggerChamp] == undefined) triggerStats[triggerChamp] = [0,0,0,0];
			triggerStats[triggerChamp][logData[i].message.data.triggerIndex]++;
			triggerPoints.push(MakePoint(logData[i].message.data.p));
		}
		if(tags[currentTag] == undefined) tags[currentTag] = 0; else tags[currentTag]++;
	}
	//tableOutput.appendChild(DrawMap(0.01));
	//MakeHeatmap(id, max, points)
	MakeHeatmap("All Deaths", 2, deathPointsAll);
	MakeHeatmap("Level 20 Deaths", 2, deathPoints20);
	MakeHeatmap("Sub 20 Deaths", 2, deathPointsSub20);
	MakeHeatmap("Activity (Status)", 200, movePoints);
	MakeHeatmap("Activity (Trigger)", 50, triggerPoints);
	tableOutput.appendChild(MakeGraphCanvas("player_graph"));
	MakePlayerActivityGraph("player_graph");
	tableOutput.appendChild(MakeSimpleCountList("Tag", tags));
	tableOutput.appendChild(MakePlayerStats());
	tableOutput.appendChild(MakeSimpleCountList("Removed Symbiote", removedSymbs));
	var div = document.createElement('div');
	div.classList.add("inline");
	div.appendChild(MakeRetirementStats());
	div.appendChild(MakeDeathStats());
	div.appendChild(MakeTriggerStats());
	tableOutput.appendChild(div);

	var secs = Math.round(window.performance.now() - timeStart)/1000;
	bench.innerHTML += "<br/>" + logData.length + " logs processed in " + secs + " seconds<br/><br/>";
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
function DrawMap(scale)
{
	var canvas = document.createElement('canvas');
	canvas.width = HEATMAP_SIZE;
	canvas.height = HEATMAP_SIZE;
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		ctx.scale(scale, scale);
		MakeMap(ctx, scale, "Quagmire");
	}
	return canvas;
}
function DrawCircle(ctx, scale, point, offset, color)
{
	ctx.beginPath();
	ctx.arc(point.x+offset, point.y+offset, 3/scale, 0, Math.PI*2);
	ctx.fillStyle = color;
	ctx.fill();
	//ctx.lineWidth = 1.5/scale;
	//ctx.strokeStyle = "#000000";
	//ctx.stroke();
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
function MakeMap(ctx, scale, mapName)
{
	for (let i = 0; i < gasData["map"].length; i++)
	{
		var map = gasData["map"][i];
		if(map.name != mapName) continue;
	
		for (let r = 0; r < map.regions.length; r++)
		{
			var region = map.regions[r];
			var color = GetRegion(region.regionType).mapColor;
			DrawPoly(ctx, scale, region.poly, map.mapRadius, numberToHex(color));
		}
		for (let b = 0; b < map.beacons.length; b++)
		{
			var beacon = map.beacons[b];
			DrawCircle(ctx, scale, beacon, map.mapRadius, "#00FFFF");//66EEEE
		}
		for (let b = 0; b < map.spawnPoints.length; b++)
		{
			var spawnPoint = map.spawnPoints[b];
			DrawCircle(ctx, scale, spawnPoint, map.mapRadius, "#00FF00");//78E810
		}
		for (let b = 0; b < map.lanes.length; b++)
		{
			var lane = map.lanes[b];
			var color = GetLane(lane.laneType).color;
			DrawLane(ctx, scale, lane.waypoints, map.mapRadius, "#553333");//numberToHex(color));
		}
		/*
		var mf = map.monsterFields;
		for (let m = 0; m < mf.length; m++)
		{
			var monsterField = mf[m];
			let tr = tbl.insertRow();
			var type = monsterField.lairType;
			var fieldSize = getPolyArea(monsterField.poly);
		}
		*/
	}
}
function MakePoint(point)
{
	var x = 300+point.x/100;
	var y = 300+point.y/100;
	return { x: x, y: y, value: 1 };
}
function MakeHeatmap(id, max, points)
{
	var div = document.createElement('div');
	div.style.position = "relative";
	div.style.display = "inline-block";
	div.style.margin = "0px 2px";
	div.style.padding = "0px";
	div.style.border = "1px";
	div.style.borderStyle = "solid";
	div.style.borderColor = "#4F4F4F";
	tableOutput.appendChild(div);

	var map = MakeHeatmapCont(id+"map");
	map.appendChild(DrawMap(0.01));
	div.appendChild(map);

	var title = MakeHeatmapCont(id+"title");
	div.appendChild(title);
	title.innerHTML = "<b>" + id + "</b> (max scale " + max + ", total points "+points.length+")";
	div.appendChild(MakeHeatmapCont(id));


	
	//tableOutput.appendChild(MakeHeatmapCont(id));
	MakeHeatmapFromData(id, max, points);
}
function MakeHeatmapCont(id)
{
	var div = document.createElement('div');
	//div.classList.add("inline");
	div.id = id;
	div.style.position = "absolute";
	div.style.width = HEATMAP_SIZE + "px";
	div.style.height = HEATMAP_SIZE + "px";
	return div;
}
function MakeHeatmapFromData(id, max, points)
{
	var heatmapInstance = h337.create({
		container: document.getElementById(id),
		radius: 10
	});
	var data = {
		max: max,
		data: points
	};
	heatmapInstance.setData(data);
}
function InitPlayerIfNotSeenYet(name)
{
	if(players[name] == undefined)
	{
		players[name] = {}; 
		players[name].fpsLog = [];
		players[name].latLog = [];
		players[name].currentLevel = 0;
	}
}
function UnixToInterval(unix)
{
	return parseInt(unix/GRAPH_INTERVAL);
}
const GRAPH_INTERVAL = 600;
function MakeGraphCanvas(id)
{
	var canvas = document.createElement('canvas');
	canvas.id = id;
	canvas.title = id;
	canvas.style.width = "100%";
	canvas.style.height = "400px";
	//canvas.style.maxHeight = "25%";
	return canvas;
}
function unixToString(unix)
{
	var date = new Date(unix * 1000);
	return date.toDateString() + " " + date.toLocaleTimeString();
}
function MakePlayerActivityGraph(id)
{
	var title = "Player Activity from " + unixToString(dateStart) + " to " + unixToString(dateEnd);
	var xValues = [];
	var currentPlayers = [];
	var deaths = [];
	for (var tag in graphIntervalDataPlayers)
	{
		xValues.push(tag*GRAPH_INTERVAL*1000);
		currentPlayers.push(graphIntervalDataPlayers[tag]);
		deaths.push(graphIntervalDataDeaths[tag]);
	}
	return new Chart(id, {
		data: {
			labels: xValues,
			datasets: [{
				type: "bar",
				label: "Deaths",
				backgroundColor: "#FF8080C0",
				borderColor: "#FF8080C0",
				data: deaths,
			},{
				type: "line",
				label: "Active Players",
				backgroundColor: "#fff",
				borderColor: "#fff",
				data: currentPlayers,
				stepped: true,
			}]
		},
		options: {
			plugins: {
				title: {
						display: true,
						text: title
				}
			},
			elements: {
				point: {
					radius: 0
				},
				line:{
					borderWidth: 1.5
				},
				bar:{
					borderWidth: 3 //why u no work
				}
			},
			animation: false,
			legend: { display: true },
			scales: {
				y: { beginAtZero: true },
				x: {
					type: "time", 
					time: {
						unit: "hour", 
						displayFormats: {
								hour: "MMM D H:MM"
						}
				}
				}
			},
		}
	});
}
function MakeTriggerStats()
{
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Trigger Champion", th);
	makeHeaderCell("1", th);
	makeHeaderCell("2", th);
	makeHeaderCell("3", th);
	makeHeaderCell("4", th);
	for (var champ in triggerStats)
	{
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		makeCell(triggerStats[champ][0], tr);
		makeCell(triggerStats[champ][1], tr);
		makeCell(triggerStats[champ][2], tr);
		makeCell(triggerStats[champ][3], tr);
	}
	return tbl;
}
function MakePlayerStats()
{
	var tbl = document.createElement('table');
	tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Player", th);
	makeHeaderCell("Avg FPS", th);
	makeHeaderCell("Avg Latency", th);

	for (var player in players)
	{
		let tr = tbl.insertRow();
		makeCell(player, tr);
		makeCell(round(GetAverage(players[player].fpsLog),2), tr);
		makeCell(round(GetAverage(players[player].latLog),2), tr);
	}
	return tbl;
}
function GetAverage(array)
{
	var total = 0;
	for (var i in array)
	{
		total += array[i];
	}
	return total/array.length;
}
function MakeDeathStats()
{
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Died Champion", th);
	for (let i = 1; i <= MAX_LEVEL; i++)
	{
		makeHeaderCell(i, th);
	}
	makeHeaderCell("Total Deaths", th);
	makeHeaderCell("% of All Champs", th);
	var total = 0;
	for (var champ in deaths)
	{
		for (var lvls in deaths[champ])
		{
			total += deaths[champ][lvls];
		}
	}
	for (var champ in deaths)
	{
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		var currentTotal = 0;
		for (let i = 1; i <= MAX_LEVEL; i++)
		{
			var deathsForLevel = deaths[champ][i];
			currentTotal += deathsForLevel;
			makeCell(deathsForLevel, tr);
		}
		makeCell(currentTotal, tr);
		makeCell(percToString(currentTotal/total), tr);
	}
	return tbl;
}
function MakeRetirementStats()
{
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Retired Champion", th);
	makeHeaderCell("Amount", th);
	makeHeaderCell("% of Total", th);
	makeHeaderCell("Credits", th);
	makeHeaderCell("% of Total", th);
	var total = 0;
	var totalC = 0;
	for (var champ in retirements)
	{
		total += retirements[champ][0];
		totalC += retirements[champ][1];
	}
	for (var champ in retirements)
	{
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		makeCell(retirements[champ][0], tr);
		makeCell(percToString(retirements[champ][0]/total), tr);
		makeCell(retirements[champ][1], tr);
		makeCell(percToString(retirements[champ][1]/totalC), tr);
	}
	return tbl;
}
function MakeSimpleCountList(title, map)
{
	var tbl = document.createElement('table');
	tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell(title, th);
	makeHeaderCell("Amount", th);
	for (var tag in map)
	{
		let tr = tbl.insertRow();
		makeCell(tag, tr);
		makeCell(map[tag], tr);
	}
	return tbl;
}

