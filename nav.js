const BUILD = 25;
const pages = {"enemies":true, "players":true, "symbiotes":true, "items":true, "maps":true, "diff":true};
const here = getCurrentPage();
const nav = document.getElementById("nav");

for (var page in pages)
{
	if(pages[page] != true) continue;
	MakeLink(page);
}
nav.appendChild(document.createTextNode(" - current data: Build " + BUILD));

function MakeLink(page)
{
	var path = (pages[here] != undefined ? "../" : "") + page + "/";

	var a = document.createElement('a');
	var img = document.createElement('img');
	var text = document.createTextNode(" " + capitalize(page));
	
	if(page == here) a.classList.add("current");
	img.src = path + "favicon.png";
	a.title = page;
	a.href = path;

	a.appendChild(img);
	a.appendChild(text);
	nav.appendChild(a);

	if(!isLastKey(page, pages))
	{
		var separator = document.createTextNode(" | ");
		nav.appendChild(separator);
	}
}