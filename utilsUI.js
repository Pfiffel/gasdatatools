function makeInputText(id, callback, container, value, size, eventType, className){
	eventType = typeof eventType !== 'undefined' ? eventType : "keypress";
	size = typeof size !== 'undefined' ? size : 5;
	var inputText = document.createElement('input');
	inputText.placeholder = id;
	inputText.id = id;
	inputText.size = size;
	inputText.value = value != undefined ? value : "";
	inputText.type = "text";
	if(className != undefined) inputText.classList.add(className);
	//inputText.addEventListener('keyup', callback);
	inputText.addEventListener('keypress', function (e) {
		if ((e.which || e.keyCode) === 13) callback();
	});
	container.appendChild(inputText);
	return inputText;
}
function makeInputCheckbox(id, callback, container, checked){
	var cbcont = document.createElement('div');
	cbcont.classList.add("checkbox_container");
	var input = document.createElement('input');
	input.id = id;
	input.checked = checked;
	input.type = "checkbox";
	input.addEventListener('change', callback);
	cbcont.appendChild(input);
	var newlabel = document.createElement("Label");
	newlabel.setAttribute("for", id);
	newlabel.setAttribute("id", id + " Label");
	newlabel.innerHTML = id;
	cbcont.appendChild(newlabel);
	container.appendChild(cbcont);
	return input;
}
function makeInputRadios(name, buttons, callback, container){
	var cbcont = document.createElement('div');
	cbcont.classList.add("checkbox_container");
	for (var btn in buttons)
	{
		var radioCont = document.createElement('div');
		radioCont.classList.add("radioCont");
		var input = document.createElement('input');
		var id = buttons[btn]
		input.id = id;
		input.value = id;
		input.checked = btn == 0 ? true : false;
		input.type = "radio";
		input.name = name;
		input.addEventListener('change', callback);
		radioCont.appendChild(input);
		var newlabel = document.createElement("Label");
		newlabel.setAttribute("for", id);
		newlabel.setAttribute("id", id + " Label");
		newlabel.innerHTML = id;
		radioCont.appendChild(newlabel);
		cbcont.appendChild(radioCont);
	}
	container.appendChild(cbcont);
	return cbcont;
}

function makeInputNumstep(id, callback, container, step, min, max, value){
	var input = document.createElement('input');
	input.id = id;
	input.type = "number";
	input.value = value;
	input.step = step;
	input.min = min;
	input.max = max;
	input.addEventListener('change', callback);
	container.appendChild(input);
	var newlabel = document.createElement("label");
	newlabel.setAttribute("for", id);
	newlabel.setAttribute("id", id + " Label");
	newlabel.innerHTML = id;
	container.appendChild(newlabel);
	return input;
}
function makeButton(id, callback, container, className){
	var input = document.createElement('input');
	input.id = id;
	if(className != undefined) input.classList.add(className);
	input.type = "button";
	input.value = id;
	input.addEventListener('click', callback);
	container.appendChild(input); 
}
function makeDividerH(html, width, container){
	var div = document.createElement("div");
	div.style.display = "inline-block"; 
	div.style.width = width + "px"; 
	div.innerHTML = html;
	container.appendChild(div);
}
function makeDividerV(html, height, container){
	var div = document.createElement("div");
	div.style.display = "block"; 
	div.style.height = height + "px"; 
	div.innerHTML = html;
	container.appendChild(div);
}
function makeAudio(container, type, path, volume){
	var sound      = document.createElement('audio');
	sound.id       = 'audio-player';
	sound.controls = 'controls';
	sound.src      = path;
	sound.type     = 'audio/ogg';
	sound.volume = volume/400;
	//sound.style.scale="0.5"
	//sound.style.width="50%";
	var newlabel = document.createElement("div");
	
	newlabel.innerHTML = type+" ("+volume+"): ";
	var cont = document.createElement("div");
	cont.appendChild(newlabel); 
	//if(className != undefined) input.classList.add(className);
	cont.appendChild(sound); 
	container.appendChild(cont); 
}