var startLogs = 22;
var endLogs = 50;

var logButtons = document.getElementById("logButtons");
var bench = document.getElementById("loadInfo");
var tableOutput = document.getElementById("tableOutput");

additionalFileLoaded = false;
var currentFile;
var timeStart;
var logData = [];

for (let i = startLogs; i < endLogs + 1; i++) {
	var logName = "Build" + i + ".log";
	if (DoesFileExist(logName)) makeButton(logName, OnLogButton, logButtons);
}
var lastBtnLog;
function OnLogButton(e) {
	timeStart = window.performance.now();
	currentFile = e.target.id;
	var btnLog = document.getElementById(currentFile);
	btnLog.disabled = true;
	if (lastBtnLog != undefined) lastBtnLog.disabled = false;
	lastBtnLog = btnLog;
	bench.innerHTML = "Loading...";
	additionalFileLoaded = false;
	loadJsonFile(currentFile, function (loadedData) {
		additionalFileLoaded = true;
		logData = JSON.parse(loadedData);
		if (allLoaded()) parseData();
	}, bench);
}
function DoesFileExist(urlToFile) {
	var xhr = new XMLHttpRequest();
	xhr.open('HEAD', urlToFile, false);
	xhr.send();
	return xhr.status !== 404;
}

var datatypes = ["map", "lair", "region", "lane"]; // for utilGAS to load files, calls parseData once completed
loadGasData();

//const HEATMAP_SIZE = 600;
const GRAPH_RESOLUTION_SECONDS = 600;

var tags = {};
var retirements = {};
var deaths = {};
var players = {};
var removedSymbs = {};
var triggerStats = {};
var seenTanks = {};
var dateStart = undefined;
var dateEnd = undefined;
var graphIntervalDataPlayers = {};
var graphIntervalDataDeaths = {};
var deathPointsAll = [];
var deathPoints20 = [];
var deathPointsSub20 = [];
var movePoints = [];
var triggerPoints = [];
var bossKillPoints = [];
var maxConcurrentPlayers = 0;
var chatLog = [];
var topDeaths = [];
//var activePlayers = {};
var lastBtn;
function ResetStats() {
	tags = {};
	retirements = {};
	deaths = {};
	players = {};
	removedSymbs = {};
	triggerStats = {};
	seenTanks = {};
	dateStart = undefined;
	dateEnd = undefined;
	graphIntervalDataPlayers = {};
	graphIntervalDataDeaths = {};
	deathPointsAll = [];
	deathPoints20 = [];
	deathPointsSub20 = [];
	movePoints = [];
	triggerPoints = [];
	bossKillPoints = [];
	maxConcurrentPlayers = 0;
	chatLog = [];
	topDeaths = [];
}
function OpenCategory(e, tab) {
	timeStart = window.performance.now();
	var btn = document.getElementById(tab);
	btn.disabled = true;
	if (lastBtn != undefined && lastBtn != btn) lastBtn.disabled = false;
	lastBtn = btn;
	tableOutput.innerHTML = "";
	if (tab == "Heatmaps") {
		//MakeHeatmap(id, max, points)
		MakeHeatmap("All Deaths", 2, deathPointsAll);
		//console.group(deathPoints20);
		MakeHeatmap("Level 20 Deaths", 2, deathPoints20);
		//console.group(deathPointsSub20);
		MakeHeatmap("Sub 20 Deaths", 2, deathPointsSub20);
		MakeHeatmap("Activity (Status)", 200, movePoints);
		MakeHeatmap("Activity (Trigger)", 50, triggerPoints);
		MakeHeatmap("Boss Deaths", 3, bossKillPoints);
	}
	else if (tab == "General") {
		MakePlayerStats(); //bit of a hack to populate playerStatSummary
		var div = document.createElement('div');
		div.innerHTML = playerStatSummary;
		tableOutput.appendChild(div);
		tableOutput.appendChild(MakeSimpleCountList("Tag", tags));
		tableOutput.appendChild(MakeSimpleCountList("Removed Symbiote", removedSymbs));
	}
	else if (tab == "Player Activity") {
		tableOutput.appendChild(MakeGraphCanvas("player_graph"));
		MakePlayerActivityGraph("player_graph");
		tableOutput.appendChild(MakePlayerStats());
	}
	else if (tab == "Chat Log") {
		tableOutput.appendChild(MakeChatLog());
	}
	else if (tab == "Tank Stats") {
		tableOutput.appendChild(MakeRetirementStats());
		tableOutput.appendChild(MakeDeathStats());
		tableOutput.appendChild(MakeTriggerStats());
	}
	else if (tab == "Deaths") {
		tableOutput.appendChild(MakeTopDeathLog());
	}
	var secs = Math.round(window.performance.now() - timeStart) / 1000;
	//bench.innerHTML += "<br/>" + tab + " tab display processed in " + secs + " seconds";
}
function parseData() {
	ResetStats();
	var secs = Math.round(window.performance.now() - timeStart) / 1000;
	bench.innerHTML = currentFile + " loaded in " + secs + " seconds";
	timeStart = window.performance.now();
	var sinceLastStatus = 0;
	var lastStatus = 0;
	for (let i = 0; i < logData.length; i++) {
		var log = logData[i];
		var data = log.message.data;
		var player = data.name;
		InitPlayerIfNotSeenYet(player);
		// seen tanks, is this really necessary to check for each message? no... but at least i won't have to worry about adding new tanks manually myself
		var tank = data.champion;
		if (tank != undefined) InitTankIfNotSeenYet(tank);
		var unix = log.unixTime;
		var toInterval = UnixToInterval(unix);
		if (graphIntervalDataPlayers[toInterval] == undefined) graphIntervalDataPlayers[toInterval] = 0;
		if (graphIntervalDataDeaths[toInterval] == undefined) graphIntervalDataDeaths[toInterval] = 0;

		let currentTag = log.message.tag;
		if (dateStart == undefined) dateStart = unix;
		if (i == logData.length - 1) dateEnd = unix;

		if (currentTag == "PlayerStatusLog") {
			if (lastStatus == 0) lastStatus = unix;
			sinceLastStatus += unix - lastStatus;
			lastStatus = unix;
			for (var playerIter in data.players) {
				var currPlayer = data.players[playerIter];
				var currName = currPlayer.name;
				var champ = currPlayer.champion;
				InitPlayerIfNotSeenYet(currName);
				if (players[currName].tanks[champ] == undefined) players[currName].tanks[champ] = 0;
				if (players[currName].lastStatus == 0) players[currName].lastStatus = unix;
				var diff = unix - players[currName].lastStatus;
				players[currName].sinceLastStatus += diff;
				players[currName].lastStatus = unix;
				// TODO hacky, log player sessions (logins and logoffs) properly
				if (diff < 10) {
					players[currName].tanks[champ] += diff;
					players[currName].totalPlaytime += diff;
				}
				if (currPlayer.fps != 0) players[currName].fpsLog.push(currPlayer.fps);
				if (currPlayer.latency != 0) players[currName].latLog.push(currPlayer.latency);
				movePoints.push(MakePoint(currPlayer.p));
			}
			var playerAmount = data.players.length;
			maxConcurrentPlayers = Math.max(maxConcurrentPlayers, playerAmount);
			graphIntervalDataPlayers[toInterval] = Math.max(graphIntervalDataPlayers[toInterval], playerAmount);
		}
		else if (currentTag == "RetirementLog") {
			var retiredChamp = data.champion;
			var c, m, a;
			c = data.credits;
			m = data.medal;
			a = data.accolade;
			players[player].retirements++;
			players[player].medals += m;
			players[player].accolades += a;
			if (retirements[retiredChamp] == undefined) retirements[retiredChamp] = [0, 0, 0, 0];
			retirements[retiredChamp][0]++;
			retirements[retiredChamp][1] += c;
			retirements[retiredChamp][2] += m;
			retirements[retiredChamp][3] += a;
			AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "PlayerDeathLog") {
			players[player].deaths++;
			if (deaths[tank] == undefined) deaths[tank] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var level = data.level; //players[data.name].currentLevel; 
			deaths[tank][level]++;
			deathPointsAll.push(MakePoint(data.p));
			if (level == 20) {
				if (players[player].recentTopDeath != null) {
					topDeaths.push(players[player].recentTopDeath);
				}
				var topDeathData = {};
				topDeathData.log = log;
				topDeathData.kills = players[player].currentTotalBossKills;
				topDeathData.level = level; // also in log.data.level
				topDeathData.unix = unix; // also in log.unixTime
				topDeathData.comments = [];
				players[player].recentTopDeath = topDeathData;

				// TODO figure out why heatmap doesn't show for build 21 despite this being populated
				deathPoints20.push(MakePoint(data.p));
			}
			if (level < 20) deathPointsSub20.push(MakePoint(data.p));
			graphIntervalDataDeaths[toInterval]++;
			AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "BossKillLog") {
			//bossKillPoints.push(MakePoint(log.message.data.p));
			players[player].currentTotalBossKills = data.totalBossKills;
			players[player].bossKills++;
			//AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "BossDeathLog") {
			bossKillPoints.push(MakePoint(log.message.data.p));
			AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "PlayerChatLog") {
			var cTD = players[player].recentTopDeath;
			if (cTD != null && ((unix - cTD.unix) < 60)) {
				players[player].recentTopDeath.comments.push(data.message);
			}
			players[player].chats++;
			AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "PlayerSpawnLog") {
			players[player].currentLevel = data.level;
			players[player].currentTotalBossKills = 0;
		}
		else if (currentTag == "LevelUpLog") {
			players[player].levelUps++;
			players[player].currentLevel = data.level + 1;
			if (players[player].currentLevel == 20) AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "PlayerLoginLog") {
			var cTD = players[player].recentTopDeath;
			if (cTD != null) {
				if (cTD.nextLogin == undefined)
					cTD.nextLogin = unix - cTD.unix;
				if ((unix - cTD.unix) < 120)
					cTD.ragequit = false;
			}
			AddChatLog(unix, data, currentTag);
			graphIntervalDataPlayers[toInterval]++;
		}
		else if (currentTag == "PlayerDisconnectLog") {
			var cTD = players[player].recentTopDeath;
			if (cTD != null) {
				if (cTD.nextLogoff == undefined)
					cTD.nextLogoff = unix - cTD.unix;
				if ((unix - cTD.unix) < 120)
					cTD.ragequit = true;
			}
			AddChatLog(unix, data, currentTag);
			graphIntervalDataPlayers[toInterval]--;
			// TODO figure out why this can become < 0 in the first place
			graphIntervalDataPlayers[toInterval] = Math.max(graphIntervalDataPlayers[toInterval], 0);
		}
		else if (currentTag == "LootPickupLog") {
			AddChatLog(unix, data, currentTag);
		}
		else if (currentTag == "SymbioteRemoveLog") {
			var removedSymb = data.symbiote;
			if (removedSymbs[removedSymb] == undefined) removedSymbs[removedSymb] = 0;
			removedSymbs[removedSymb]++;
		}
		else if (currentTag == "TriggerLog") {
			var triggerChamp = data.champion;
			if (triggerStats[triggerChamp] == undefined) triggerStats[triggerChamp] = [0, 0, 0, 0];
			triggerStats[triggerChamp][data.triggerIndex]++;
			triggerPoints.push(MakePoint(data.p));
		}
		if (tags[currentTag] == undefined) tags[currentTag] = 1; else tags[currentTag]++;
	}
	SortTanks();
	var secs = Math.round(window.performance.now() - timeStart) / 1000;
	bench.innerHTML += "<br/>" + logData.length + " logs processed in " + secs + " seconds";
	OpenCategory(null, "General");
}
// http://www.jeffreythompson.org/collision-detection/poly-point.php
function PointIsInPoly(vertices, p) {
	var collision = false;
	var next = 0;
	for (let current = 0; current < vertices.length; current++) {
		next = current + 1;
		if (next == vertices.length) next = 0;
		var vc = vertices[current];    // c for "current"
		var vn = vertices[next];       // n for "next"
		if (((vc.y >= p.y && vn.y < p.y) || (vc.y < p.y && vn.y >= p.y)) &&
			(p.x < (vn.x - vc.x) * (p.y - vc.y) / (vn.y - vc.y) + vc.x)) {
			collision = !collision;
		}
	}
	return collision;
}
function GetZoneFromPoint(p) {
	if (p == undefined) return null;
	for (let i = 0; i < gasData["map"].length; i++) {
		var map = gasData["map"][i];
		if (map.name != "Quagmire") continue;

		var mf = map.monsterFields;
		for (let m = 0; m < mf.length; m++) {
			var monsterField = mf[m];

			if (PointIsInPoly(monsterField.poly, p)) {
				var color = getLair(monsterField.lairType).color;
				// TODO parse and cache these at the start
				var zoneInfo = {};
				zoneInfo.color = color;
				zoneInfo.name = monsterField.sectorName;
				return zoneInfo;
			}
		}
	}
	return null;
}
function AddChatLog(unix, data, type) {
	// TODO switch
	if (type == "BossKillLog") data.message = "(defeated " + data.monsterName + ")";
	if (type == "BossDeathLog") data.message = "(" + data.monsterName + " was defeated)";
	if (type == "PlayerLoginLog") data.message = "(connected)";
	else if (type == "PlayerDisconnectLog") data.message = "(disconnected)";
	if (type == "PlayerDeathLog") data.message = "(died)";
	if (type == "RetirementLog") data.message = "(retired)";
	if (type == "LootPickupLog") data.message = "(picked up " + MakeItemList(data.items) + ")";
	if (type == "LevelUpLog") data.message = "(reached level " + (data.level + 1) + ")";
	data.unix = unix;
	data.type = type;
	chatLog.push(data);
}
function MakeItemList(list) {
	var s = "";
	for (let i = 0; i < list.length; i++) {
		if (i != 0) s += ", ";
		var item = list[i];
		s += item;
	}
	return s;
}
function MakeChatLog() {
	var chatLogOutput = document.createElement('table');
	let th = chatLogOutput.insertRow();
	makeHeaderCell("Timestamp", th);
	makeHeaderCell("Type", th);
	makeHeaderCell("Name", th);
	makeHeaderCell("Tank", th);
	makeHeaderCell("Level", th);
	makeHeaderCell("Location", th);
	makeHeaderCell("Message", th);
	for (var i in chatLog) {
		var name = chatLog[i].name == undefined ? "" : chatLog[i].name;
		var messageType = GetMessageColorClass(chatLog[i].type, name);
		//if(messageType == "chat_system") continue;
		let tr = chatLogOutput.insertRow();
		var champion = chatLog[i].champion == undefined ? "" : chatLog[i].champion;
		var message = chatLog[i].message == undefined ? "" : chatLog[i].message;
		var level = chatLog[i].level == undefined ? "" : chatLog[i].level;
		makeCell(unixToStringYMDHMS(chatLog[i].unix), tr, messageType);
		makeCell(chatLog[i].type, tr, messageType);
		makeCell(name, tr, messageType);
		makeCell(champion, tr, messageType);
		makeCell(level, tr, messageType);
		var zoneInfo = GetZoneFromPoint(chatLog[i].p);
		var zoneCell = makeCell(zoneInfo != null ? zoneInfo.name : "", tr, messageType);
		if (zoneInfo != null) zoneCell.style.color = numberToHex(zoneInfo.color);
		makeCell(message, tr, messageType);
	}
	return chatLogOutput;
}
function GetMessageColorClass(type, name) {
	if (type == "PlayerChatLog") {
		/*var lc = name.toLowerCase();
		if(lc == "rob") return "chat_admin";
		if(lc == "amitp" || lc == "pfiffel") return "chat_dev";*/
		return "chat_default";
	}
	if (type == "PlayerDeathLog") return "chat_death";
	return "chat_system";
}
function MakePoint(point) {
	var x = 300 + point.x / 100;
	var y = 300 + point.y / 100;
	return { x: x, y: y, value: 1 };
}
function MakeTopDeathLog() {
	var tbl = document.createElement('table');
	let th = tbl.insertRow();
	makeHeaderCell("Timestamp", th);
	makeHeaderCell("Name", th);
	makeHeaderCell("Level", th);
	makeHeaderCell("Kills", th);
	makeHeaderCell("Tank", th);
	makeHeaderCell("Location", th);
	makeHeaderCell("Ragequit", th);
	makeHeaderCell("Next Logoff", th);
	makeHeaderCell("Next Login", th);
	makeHeaderCell("Comments", th);
	for (var player in players) {
		if (players[player].recentTopDeath != null) {
			topDeaths.push(players[player].recentTopDeath);
		}
	}
	let totalQuits = 0;
	for (var i in topDeaths) {
		var death = topDeaths[i];
		var data = death.log.message.data;
		let tr = tbl.insertRow();
		makeCell(unixToStringYMDHMS(death.unix), tr);
		makeCell(data.name, tr);
		makeCell(data.level, tr);
		makeCell(death.kills, tr);
		makeCell(data.champion, tr);
		var zoneInfo = GetZoneFromPoint(data.p);
		var zoneCell = makeCell(zoneInfo != null ? zoneInfo.name : "", tr);
		if (zoneInfo != null) zoneCell.style.color = numberToHex(zoneInfo.color);
		if (death.ragequit == true) totalQuits++;
		makeCell(death.ragequit != undefined ? death.ragequit : "", tr);
		makeCell(death.nextLogoff != undefined ? secondsToClock(death.nextLogoff) : "", tr);
		makeCell(death.nextLogin != undefined ? secondsToClock(death.nextLogin) : "", tr);
		makeCell(death.comments.toString(), tr);
	}

	var div = document.createElement('div');
	var divStats = document.createElement('div');
	var quitperc = totalQuits / topDeaths.length;
	divStats.innerHTML = "Ragequits (logoff within 2 minutes): " + totalQuits + " of " + topDeaths.length + " level 20 deaths (" + round(quitperc * 100, 2) + "%)";
	div.appendChild(divStats);
	div.appendChild(tbl);
	return div;
}
function MakeHeatmap(id, max, points) {
	var div = document.createElement('div');
	div.style.position = "relative";
	div.style.display = "inline-block";
	div.style.margin = "0px 2px";
	div.style.padding = "0px";
	div.style.border = "1px";
	div.style.borderStyle = "solid";
	div.style.borderColor = "#4F4F4F";
	tableOutput.appendChild(div);

	var map = MakeHeatmapCont(id + "map");
	map.appendChild(DrawMap("Quagmire", 0.01));
	div.appendChild(map);

	var title = MakeHeatmapCont(id + "title");
	div.appendChild(title);
	title.innerHTML = "<b>" + id + "</b> (max scale " + max + ", total points " + points.length + ")";
	div.appendChild(MakeHeatmapCont(id));



	//tableOutput.appendChild(MakeHeatmapCont(id));
	MakeHeatmapFromData(id, max, points);
}
function MakeHeatmapCont(id) {
	var div = document.createElement('div');
	//div.classList.add("inline");
	div.id = id;
	div.style.position = "absolute";
	div.style.width = MAP_CANVAS_SIZE + "px";
	div.style.height = MAP_CANVAS_SIZE + "px";
	return div;
}
function MakeHeatmapFromData(id, max, points) {
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
function UnixToInterval(unix) {
	return parseInt(unix / GRAPH_RESOLUTION_SECONDS);
}
function MakeGraphCanvas(id) {
	var canvas = document.createElement('canvas');
	canvas.id = id;
	canvas.title = id;
	canvas.style.width = "100%";
	canvas.style.height = "400px";
	//canvas.style.maxHeight = "25%";
	return canvas;
}
function unixToStringYMDHMS(unix) {
	var date = new Date(unix * 1000);
	return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0') + " " +
		date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + ":" + date.getSeconds().toString().padStart(2, '0');
}
function unixToString(unix) {
	var date = new Date(unix * 1000);
	return date.toDateString() + " " + date.toLocaleTimeString();
}
function unixToStringDay(unix) {
	var date = new Date(unix * 1000);
	return date.toDateString();
}
function MakePlayerActivityGraph(id) {
	var title = "Player Activity from " + unixToString(dateStart) + " to " + unixToString(dateEnd);
	var xValues = [];
	var currentPlayers = [];
	var deaths = [];
	for (var tag in graphIntervalDataPlayers) {
		xValues.push(tag * GRAPH_RESOLUTION_SECONDS * 1000);
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
			}, {
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
				line: {
					borderWidth: 1.5
				},
				bar: {
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
function MakeTriggerStats() {
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Trigger Champion", th);
	makeHeaderCell("1", th);
	makeHeaderCell("2", th);
	makeHeaderCell("3", th);
	makeHeaderCell("4", th);
	for (var champ in triggerStats) {
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		makeCell(triggerStats[champ][0], tr);
		makeCell(triggerStats[champ][1], tr);
		makeCell(triggerStats[champ][2], tr);
		makeCell(triggerStats[champ][3], tr);
	}
	return tbl;
}
function InitPlayerIfNotSeenYet(name) {
	if (players[name] == undefined) {
		players[name] = {};
		players[name].fpsLog = [];
		players[name].latLog = [];
		players[name].deaths = 0;
		players[name].levelUps = 0;
		players[name].retirements = 0;
		players[name].medals = 0;
		players[name].accolades = 0;
		players[name].bossKills = 0;
		players[name].currentTotalBossKills = 0;
		players[name].recentTopDeath = null;
		players[name].chats = 0;
		players[name].sinceLastStatus = 0;
		players[name].lastStatus = 0;
		players[name].totalPlaytime = 0;
		players[name].tanks = {};
	}
}
function InitTankIfNotSeenYet(name) {
	if (seenTanks[name] == undefined) {
		seenTanks[name] = name;
	}
}
function SortTanks() {
	seenTanks = Object.keys(seenTanks).sort().reduce(
		(obj, key) => {
			obj[key] = seenTanks[key];
			return obj;
		},
		{}
	);
}
function PlayersAsSortedArray() {
	var sortable = [];
	for (var player in players) {
		sortable.push([player, players[player].totalPlaytime]);
	}
	sortable.sort(function (a, b) {
		return b[1] - a[1];
	});
	return sortable;
}
var playerStatSummary = "";
function MakePlayerStats() {
	var tbl = document.createElement('table');
	tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Player", th);
	makeHeaderCell("Deaths", th);
	makeHeaderCell("Boss Kills", th);
	makeHeaderCell("Retirements (M, A)", th);
	makeHeaderCell("Chats", th);
	makeHeaderCell("Playtime", th);
	for (var champ in seenTanks) {
		makeHeaderCell(champ, th);
	}
	makeHeaderCell("Avg FPS", th);
	makeHeaderCell("Avg Latency", th);

	var playersAsSortedArray = PlayersAsSortedArray();
	var dT = 0, lT = 0, rT = 0, mT = 0, aT = 0, bT = 0, chatsT = 0;
	var seenPlayers = 0, activePlayers = 0;
	var totalPlaytimeAll = {};
	var totalPlaytimeGlobal = 0;
	for (var i in playersAsSortedArray) {
		var player = playersAsSortedArray[i][0];
		var d, l, r, m, a, b, chats;
		dT += d = players[player].deaths;
		lT += l = players[player].levelUps;
		rT += r = players[player].retirements;
		mT += m = players[player].medals;
		aT += a = players[player].accolades;
		bT += b = players[player].bossKills;
		chatsT += chats = players[player].chats;
		seenPlayers++;
		var wasActive = (d + l + r + b + chats) > 0;
		if (wasActive) activePlayers++;
		if (!wasActive) continue;
		let tr = tbl.insertRow();
		makeCell(player, tr);
		makeCell(d != 0 ? d : "", tr);
		makeCell(b != 0 ? b : "", tr);
		makeCell(r != 0 ? r + ((m + a) > 0 ? " (" + m + ", " + a + ")" : "") : "", tr);
		makeCell(chats != 0 ? chats : "", tr);

		for (var champ in seenTanks) {
			var playTime = players[player].tanks[champ];
			if (totalPlaytimeAll[champ] == undefined) totalPlaytimeAll[champ] = 0;
			totalPlaytimeAll[champ] += playTime != undefined ? playTime : 0;
		}
		totalPlaytimeGlobal += players[player].totalPlaytime;
		makeCell(secondsToClock(players[player].totalPlaytime), tr);
		for (var champ in seenTanks) {
			var playTime = players[player].tanks[champ];
			var perc = playTime / players[player].totalPlaytime;
			//makeCell(playTime != undefined ? secondsToClock(playTime) + " - " + percToString(perc) : "", tr);
			makeCell(playTime != undefined ? percToString(perc) : "", tr);
		}

		makeCell(round(GetAverage(players[player].fpsLog), 2), tr);
		makeCell(round(GetAverage(players[player].latLog), 2), tr);
	}
	var sTotalPlaytime = "<u>Total Playtimes</u>" + "<br/>";
	for (var champ in totalPlaytimeAll) {
		var currChampPlay = totalPlaytimeAll[champ];
		sTotalPlaytime += champ + ": " + secondsToDhms(currChampPlay) + " - " + percToString(currChampPlay / totalPlaytimeGlobal) + "<br/>";
	}
	sTotalPlaytime += "All: " + secondsToDhms(totalPlaytimeGlobal) + "<br/>";

	playerStatSummary = "<u>Totals</u> (" + unixToStringDay(dateStart) + " - " + unixToStringDay(dateEnd) + ")<br/>" +
		"Players Seen: " + seenPlayers + "<br/>" +
		"Players Active: " + activePlayers + " (at least one level up, death, retirement or chat)<br/>" +
		"Max Concurrent Players: " + maxConcurrentPlayers + "<br/>" +
		"Deaths: " + dT + "<br/>" +
		"Level Ups: " + lT + "<br/>" +
		"Retirements: " + rT + " (" + mT + " Medals, " + aT + " Accolades)<br/>" +
		"Boss deaths: " + bossKillPoints.length + " (" + bT + " kills)<br/>" +
		"Chats: " + chatsT + "<br/>" + "<br/>" +
		sTotalPlaytime;
	return tbl;
}
function GetAverage(array) {
	var total = 0;
	for (var i in array) {
		total += array[i];
	}
	return total / array.length;
}
function MakeDeathStats() {
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Died Champion", th);
	for (let i = 1; i <= MAX_LEVEL; i++) {
		makeHeaderCell(i, th);
	}
	makeHeaderCell("Total Deaths", th);
	makeHeaderCell("% of All Champs", th);
	var total = 0;
	for (var champ in deaths) {
		for (var lvls in deaths[champ]) {
			total += deaths[champ][lvls];
		}
	}
	for (var champ in deaths) {
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		var currentTotal = 0;
		for (let i = 1; i <= MAX_LEVEL; i++) {
			var deathsForLevel = deaths[champ][i];
			currentTotal += deathsForLevel;
			makeCell(deathsForLevel, tr);
		}
		makeCell(currentTotal, tr);
		makeCell(percToString(currentTotal / total), tr);
	}
	return tbl;
}
function MakeRetirementStats() {
	var tbl = document.createElement('table');
	//tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell("Retired Champion", th);
	makeHeaderCell("Amount", th);
	makeHeaderCell("% of Total", th);
	makeHeaderCell("Credits", th);
	makeHeaderCell("Medals", th);
	makeHeaderCell("Accolades", th);
	makeHeaderCell("% of Total", th);
	var total = 0;
	var totalC = 0;
	var totalM = 0;
	var totalA = 0;
	for (var champ in retirements) {
		total += retirements[champ][0];
		totalC += retirements[champ][1];
		totalM += retirements[champ][2];
		totalA += retirements[champ][3];
	}
	for (var champ in retirements) {
		let tr = tbl.insertRow();
		makeCell(champ, tr);
		makeCell(retirements[champ][0], tr);
		makeCell(percToString(retirements[champ][0] / total), tr);
		makeCell(retirements[champ][1], tr);
		makeCell(retirements[champ][2], tr);
		makeCell(retirements[champ][3], tr);
		makeCell(percToString(retirements[champ][1] / totalC), tr);
	}
	return tbl;
}
function MakeSimpleCountList(title, map) {
	var tbl = document.createElement('table');
	tbl.classList.add("inline");
	let th = tbl.insertRow();
	makeHeaderCell(title, th);
	makeHeaderCell("Amount", th);
	for (var tag in map) {
		let tr = tbl.insertRow();
		makeCell(tag, tr);
		makeCell(map[tag], tr);
	}
	return tbl;
}

