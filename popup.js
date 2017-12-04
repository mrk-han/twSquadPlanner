var draggableDiv = function (d) {
    addEvent(d, 'dragover', function (e) {
        if (e.preventDefault) e.preventDefault(); // allows us to drop
        this.className = 'over';
        e.dataTransfer.dropEffect = 'move';
        return false;
    });

    // to get IE to work
    addEvent(d, 'dragenter', function (e) {
        this.className = 'over';
        return false;
    });

    addEvent(d, 'dragleave', function () {
        this.className = '';
    });

    addEvent(d, 'drop', function (e) {
      if (e.stopPropagation) {
          e.stopPropagation();
      }

      var el = document.getElementById(e.dataTransfer.getData('text/html'));
      if (!el.innerHTML.includes("<br>")) {
          var br = document.createElement("br");
          el.appendChild(br);      
      }
      this.appendChild(el);

      return false;
    });  
};

var getToonIndex = function (name) {
    var idx = -1;
    var i = 0;
    while (i < save.toons.length) {
        if (save.toons[i].name == name) {
            idx = i;
            return idx;
        }
        i++;
    }
    return idx;
}

var save = {
    "squads": [],
    "toons": []
};

draggableDiv(document.querySelector('#toons'));

// $("div#toons").append('<li><a href="#" id="one">one</a></li>');

document.getElementById("getToons").addEventListener('click', () => {
    console.log("Popup DOM fully loaded and parsed");

    function getDocumentHTML() {
        return document.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: '(' + getDocumentHTML + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        //Here we have just the innerHTML and not DOM structure
        var doc = results[0];
        
        // $(doc).find('div.collection-char-gp').length
        powerArray = $(doc).find('div.collection-char-gp');
        console.log(powerArray);
        
        for (var i = 0; i < powerArray.length; i++) {
            var toon = {};
            var parts = powerArray[i].dataset.originalTitle.split(' / ')[0].split(' ');
            var power = parts[1].replace(',','');
            if (power < 6000) {
                break;
            }
            var name = $(doc).find('a.collection-char-name-link')[i].innerText;
            toon.name = name;
            toon.power = power;
            if (getToonIndex(name) < 0) {
                save.toons.push(toon);
            }
        }
        
        newSquadCount = Math.ceil(save.toons.length/5);
        console.log(newSquadCount);
        if (newSquadCount > save.squads.length) {
            for (var i = save.squads.length; i < newSquadCount; i++) {
                var iDiv = document.createElement('div');
                var br = document.createElement('br');
                iDiv.id = 'squad';
                iDiv.squadId = 'Squad ' + i;
                draggableDiv(iDiv);
                iDiv.append(iDiv.squadId);
                iDiv.append(br);
                $("div#container").append(iDiv);
                save.squads.push(iDiv);
            }
            
            for (var i = 0; i < save.toons.length; i++) {
                $("div#toons").append('<li><a href="#" id="' + save.toons[i].name + '">' + save.toons[i].name + '</a></li>');
            }
        }
        
        console.log(save);
        
        
        var links = document.querySelectorAll('li > a'), el = null;
        for (var i = 0; i < links.length; i++) {
            el = links[i];

            el.setAttribute('draggable', 'true');

            addEvent(el, 'dragstart', function (e) {
                e.dataTransfer.effectAllowed = 'move'; 
                e.dataTransfer.setData('text/html', this.innerHTML.replace("<br>",""));
            });
        }
    });
});