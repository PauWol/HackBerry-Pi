//DomContet loaded to prevent property is null errors
document.addEventListener('DOMContentLoaded', ()=>{
	
	
//Visibility controll for tab system:
	
overwiew = document.getElementById('overwiew');
overwiew_a = document.getElementById('overwiew-btn');
terminal = document.getElementById('terminal');
terminal_a = document.getElementById('terminal-btn');
system = document.getElementById('system');
system_a = document.getElementById('system-btn');
wifi = document.getElementById('wifi');
wifi_a = document.getElementById('wifi-btn');

document.getElementById('overwiew-btn').addEventListener('click',()=>{
	hide_all_components()
	overwiew.style.display= 'block';
	overwiew_a.classList.add("active");
});

document.getElementById('terminal-btn').addEventListener('click',()=>{
	hide_all_components()
	terminal.style.display= 'block';
	terminal_a.classList.add("active");
});

let wifi_interval = undefined;

document.getElementById('wifi-btn').addEventListener('click',()=>{
	hide_all_components()
	wifi.style.display= 'block';
	wifi_a.classList.add("active");
	get_wifis();
	wifi_interval = setInterval(() => {
		get_wifis()
	}, 30000);
});

let info_interval = undefined;

document.getElementById('system-btn').addEventListener('click',()=>{
	hide_all_components();
	system.style.display= 'block';
	system_a.classList.add("active");
	get_sys_info()
	info_interval = setInterval(() => {
	   get_sys_info() 
	},  20000);
});

function hide_all_components() {
	
	(info_interval) ? clearInterval(info_interval) : undefined;
	(wifi_interval) ? clearInterval(wifi_interval) : undefined;
	
	overwiew.style.display = 'none';
	overwiew_a.classList.remove("active");

	terminal.style.display = 'none';
	terminal_a.classList.remove("active");
	
	system.style.display = 'none';
	system_a.classList.remove("active");

	wifi.style.display = 'none';
	wifi_a.classList.remove("active");

};



//-------------------------------------------------------------

//Terminal script:


//html form part
//const cmd_btn = document.getElementById('btn-cmd');
//const form = document.getElementById('cmd-form');
const cmd_inp = document.getElementById('cmd-inp');
const div_out = document.getElementById('out');

//function for sending commands
function send_command(inp){
	if(inp != ''){
	  const xhr = new XMLHttpRequest();
	  
	  xhr.open('POST', '/control');
	  xhr.setRequestHeader('Content-Type', 'application/json');

	  xhr.send(JSON.stringify({ 'command':inp }));

	  xhr.onload = () => {
		if (xhr.status === 200) {
		  console.log('POST request successful:', xhr.response);
		  let output = JSON.parse(xhr.response).output;
		  addContent(output)
		} else {
		  console.error('POST request failed:', xhr.statusText);
		  addContent(xhr.statusText)
		}
	  };
	}
};

//Command list to temporery save them

let command_list = []

function save_command(inp){
	if(inp != ''){
		if(command_list.includes(inp)) {
			command_list.splice(command_list.indexOf(inp),1);
			command_list.push(inp)
		}
		else{
			command_list.push(inp)
		}
	}
}

//get the last used commats out of a list 
function get_command(inp_current_command,type='up'||'down'){
	if(command_list.length != 0){
		let cmdArray = command_list.slice().reverse();
		if(cmdArray.includes(inp_current_command)){
			index = cmdArray.indexOf(inp_current_command);
			if(type.toLowerCase()=='up' &&  cmdArray.length -1 != index){
				return cmdArray[index + 1]
			}
			else if(type.toLowerCase()=='down' && index != 0){
				return cmdArray[index - 1]
			};
		}
		else {
			if(type.toLowerCase()=='up'){
				return cmdArray[0]
			};
		};
	};
	return ''
};

//function for setting input af input to end
function setCursorToEnd(inputElement) {
    inputElement.focus();
    inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
}

//function to add content in the terminal ui
	function addContent(inp) {
		if(inp != ''){
			const p = document.createElement('pre');
			p.classList.add('bash');
			p.textContent = inp;
			div_out.appendChild(p);
			div_out.scrollTo({
			top: div_out.scrollHeight,
			behavior: 'smooth'
			});
		};
	};

//remove all children
function removeAllChildren(theParent){
  const rangeObj = new Range();
  rangeObj.selectNodeContents(theParent);
  rangeObj.deleteContents();
}

//handler for the inputs --> events
cmd_inp.addEventListener('keydown', function(event) {
	if (event.key === 'Enter') {
	  handleCommand(cmd_inp.value);
	  save_command(cmd_inp.value);
	  cmd_inp.value = '';
	}
	if (event.key === 'ArrowUp') {
		cmd_inp.value = get_command(cmd_inp.value,'up');
		setCursorToEnd(cmd_inp);
	}
	if (event.key === 'ArrowDown') {
		cmd_inp.value = get_command(cmd_inp.value,'down');
		setCursorToEnd(cmd_inp);
	}
});

//handler for commands 
function handleCommand(command) {
	addContent('$ ' + command);
	send_command(command)
	switch(command) {
			case 'clear':
				removeAllChildren(div_out);
				break;
	//Add casese here
			
	}
};

//Status
function update_show(level, id_numb,id_state,id_show) {
    const id_number_field = document.getElementById(id_numb),
          id_status_field = document.getElementById(id_state),
          id_show_field = document.getElementById(id_show)

        id_number_field.innerHTML = level + '%';

        id_show_field.style.height = level+'%';


        if(level == 100){ /* We validate if the battery is full */
            id_status_field.innerHTML = `Maximum Utilization <i class="ri-battery-2-fill green-color"></i>`
            id_status_field.style.height = '103%' /* To hide the ellipse */
        }
        else if(level <= 20){ /* We validate if the battery is low */
            id_status_field.innerHTML = `Low Utilization <i class="ri-plug-line animated-red"></i>`
        }
        else if(level > 20 && level <= 60 ){ /* We validate if the battery is charging */
            id_status_field.innerHTML = `Medium Utilization <i class="ri-flashlight-line animated-green"></i>`
        }
        else if(level > 60 && level <= 99 ){ /* We validate if the battery is charging */
            id_status_field.innerHTML = `High Utilization <i class="ri-flashlight-line animated-green"></i>`
        }
        else{ /* If it's not loading, don't show anything. */
            id_status_field.innerHTML = ''
        }
    
        if(level <=20){
			id_show_field.classList.add('gradient-color-green')
            id_show_field.classList.remove('gradient-color-red','gradient-color-orange','gradient-color-yellow')
        }
        else if(level <= 40){
			id_show_field.classList.add('gradient-color-yellow')
            id_show_field.classList.remove('gradient-color-red','gradient-color-orange','gradient-color-green')
            
        }
        else if(level <= 80){
			id_show_field.classList.add('gradient-color-orange')
            id_show_field.classList.remove('gradient-color-red','gradient-color-yellow','gradient-color-green')
        }
        else if(level > 80){
            id_show_field.classList.add('gradient-color-red')
            id_show_field.classList.remove('gradient-color-orange','gradient-color-yellow','gradient-color-green')
        }
    
}

function get_sys_info() {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "/info");
	xhr.onload = function () {
	  if (xhr.status === 200) {
		console.log(xhr.response);
		update_show(JSON.parse(xhr.response).info.cpu_usage,'cpu-perc','cpu-state','cpu-show')
		update_show(JSON.parse(xhr.response).info.memory_usage_p,'ram-perc','ram-state','ram-show')
		update_progressbar(JSON.parse(xhr.response).info.disk_usage,'bar','perc')
		//return xhr.response
	  } else {
		console.error("Request failed. Status:", xhr.status);
	  }
	};
	xhr.send();	
}

//update progressbar
function update_progressbar(inp,id_bar,id_perc) {
    if(inp <= 100) {
      let bar = document.getElementById(id_bar);
      let perc = document.getElementById(id_perc);

      bar.style.width = inp+'%';
      perc.innerHTML = inp+'%';
      
       if(inp <=20){
			bar.classList.add('gradient-color-green')
            bar.classList.remove('gradient-color-red','gradient-color-orange','gradient-color-yellow')
        }
        else if(inp <= 40){
			bar.classList.add('gradient-color-yellow')
            bar.classList.remove('gradient-color-red','gradient-color-orange','gradient-color-green')
            
        }
        else if(inp <= 80){
			bar.classList.add('gradient-color-orange')
            bar.classList.remove('gradient-color-red','gradient-color-yellow','gradient-color-green')
        }
        else if(inp > 80){
            bar.classList.add('gradient-color-red')
            bar.classList.remove('gradient-color-orange','gradient-color-yellow','gradient-color-green')
        }
    }
}
//Wifi section
function wifi_template(i) {
	const listItem = document.createElement("li");
	
	// Create the dropdown container (div)
	const dropdownDiv = document.createElement("div");
	dropdownDiv.classList.add("dropdown");
	
	// Create the dropdown button (button)
	const dropdownButton = document.createElement("button");
	dropdownButton.classList.add("dropbtn");
	dropdownButton.textContent = `${i['ESSID']} >> ${i['Address']}`;
	dropdownButton.onclick = ()=>{dropdownToggel(i['Address']) }; // Assuming you have a function named dropdownToggel()
	
	// Create the dropdown content (div)
	const dropdownContent = document.createElement("div");
	dropdownContent.classList.add("dropdown-content");
	dropdownContent.id = i['Address'];
	
	// Create anchor elements for the links
	const deauth = document.createElement("a");
	deauth.href = "#deauth";
	deauth.textContent = "Deauth";
	deauth.onclick = ()=>{
		handleCommand('sudo wifi -da wlan1'+' '+i['Address']+' 50');
		save_command('sudo wifi -da wlan1'+' '+i['Address']+' 50');
		closeAllOpenDropdowns()
	}
	
	const handshake = document.createElement("a");
	handshake.href = "#handshake";
	handshake.textContent = "Handshake";
	handshake.onclick = ()=>{
		handleCommand('sudo wifi -h wlan1 ' + i['Address'] + ' ' + i['Channel'] + ' ' + i['ESSID']);
		save_command('sudo wifi -h wlan1 ' + i['Address'] + ' ' + i['Channel'] + ' ' + i['ESSID'])
		closeAllOpenDropdowns()
	}
	
	const info = document.createElement("a");
	info.href = "#wifi_info";
	info.textContent = "Info";
	info.onclick = ()=>{
		closeAllOpenDropdowns()
		createModal('ww', {
			title: i['ESSID'],
			content: `
			ESSID: ${i['ESSID']}<br>
			MACADRESS: ${i['Address']}<br>
			Protocol: ${i['Protocol']}<br>
			Mode: ${i['Mode']}<br>
			Frequency: ${i['Frequency']}<br>
			Channel: ${i['Channel']}<br>
			Encryption: ${i['Encryption']}<br>
			Bit Rates: ${['Bit Rates']}<br>
			Quality: ${i['Quality']}<br>
			Signal level: ${i['Signal level']}`
		  });
	}
	
	// Append links to dropdown content
	dropdownContent.appendChild(deauth);
	dropdownContent.appendChild(handshake);
	dropdownContent.appendChild(info);
	
	// Append dropdown button and content to dropdown container
	dropdownDiv.appendChild(dropdownButton);
	dropdownDiv.appendChild(dropdownContent);
	
	// Append dropdown container to list item
	listItem.appendChild(dropdownDiv);

	window.onclick = (event) => {
		if (!event.target.matches('.dropbtn')) {
		  var dropdowns = document.getElementsByClassName("dropdown-content");
		  var i;
		  for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
			  openDropdown.classList.remove('show');
			}
		  }
		}
	};
	
	// Return the created list item
	return listItem;// Create the <li> element
		
}
const forLoop = document.getElementById('for-loop')
function wifi_list_update(wifi_array) {
	removeAllChildren(forLoop)
	wifi_array.forEach(element => {
		forLoop.appendChild(wifi_template(element));
	});
}
function dropdownToggel(id) {
	closeAllOpenDropdowns()
	document.getElementById(id).classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
	
  }
function get_wifis() {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "/wifi");
	xhr.onload = function () {
	  if (xhr.status === 200) {
		console.log(xhr.response);
		wifi_list_update(JSON.parse(xhr.response))
		//return xhr.response
	  } else {
		console.error("Request failed. Status:", xhr.status);
	  }
	};
	xhr.send();	
}
function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year},${hours}:${minutes}`;
}
//Modal script------------------------------------------------------------
function createModal(targetElementId, content) {
    const targetElement = document.getElementById(targetElementId);
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.setAttribute('id', 'myModal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close');
    closeBtn.innerHTML = '&times;';

    const title = document.createElement('h2');
    title.setAttribute('id', 'modalTitle');
    title.textContent = content.title || 'Modal Title';

    const paragraph = document.createElement('p');
    paragraph.setAttribute('id', 'modalContent');
    paragraph.innerHTML = content.content || 'Modal content goes here.';

    // Append elements
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(paragraph);
    modal.appendChild(modalContent);
    targetElement.appendChild(modal);

    // Close modal when close button is clicked
    closeBtn.onclick = () => {
      removeAllChildren(targetElement)
    }

	window.onclick = (event) => {
		if (event.target == modal) {
		removeAllChildren(targetElement)
		}
	}
	modal.style.display = "block";
};
// Close modal when clicked outside the modal content

	/*
	createModal('targetElement', {
    	title: 'Dynamic Modal Title',
		content: 'This is a dynamically created modal.'
  	});
	*/
	function closeAllOpenDropdowns() {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
		  var openDropdown = dropdowns[i];
		  if (openDropdown.classList.contains('show')) {
			openDropdown.classList.remove('show');
		  }
		}
	}
//-------------------------------------------------------------------
});
