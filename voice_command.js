
let id = "root";

//FOR TEXT-TO-SPEECH
var voiceSelect = document.getElementById('voice');
function loadVoices(){
    var voices = speechSynthesis.getVoices();
    console.log(voices[145]);
    voices.forEach(function(voice, i) {
        // Create a new option element.
            var option = document.createElement('option');
        
        // Set the options value and text.
            option.value = voice.voiceURI;
        option.dataset.lang = voice.lang;
            option.innerHTML = voice.name;
              
        // Add the option to the voice selector.
            voiceSelect.appendChild(option);
        });
}
loadVoices();
window.speechSynthesis.onvoiceschanged = function(e) {
    loadVoices();
  };

//creating a SpeechSynthesisUtterance object
var utterance;
function speak(sentence) {
    utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.95;
    
    if (voiceSelect.value) {
        var selectedVoice = speechSynthesis.getVoices().filter(function(voice) { return voice.voiceURI == voiceSelect.value; })[0];
            utterance.voiceURI = selectedVoice.voiceURI;
        utterance.lang = selectedVoice.lang;
    }
    annyang.abort();
    utterance.onend = ()=>{annyang.resume()};
    speechSynthesis.speak(utterance);
    

  }
//FOR TEXT TO SPEECH

//FOR RETURNING RESULTS TO WINDOW
var result;
annyang.addCallback('result', function(phrases) {
    //console.log("I think the user said: ", phrases[0]);
    result = phrases[0];
    //console.log("But then again, it could be any of the following: ", phrases);
    document.getElementById("results").innerHTML = "What's being heard: " + result; //showing what's being said on the page
  });

//For playing sound effects on failure and successes
const successSound = new Audio("405546__raclure__loading-chime.wav");
const failedSound = new Audio("67454__splashdust__negativebeep.wav");
failedSound.volume = 0.5;

annyang.addCallback('resultMatch', function() {
    successSound.play();
    console.log('results match a command!');
    //make speech recognition say what was recognized, if on match.
  });

annyang.addCallback('resultNoMatch', function() {
    failedSound.play();
    console.log('results do not trigger any command...');
    speak("Did you say " + result + "?");
  });

//MINDMAP
var mind = {
    "meta": {
        'name': '',
        'version': '1'
    },
    'format': 'node_array',
    'data': [
        {"id": 'root', 'isroot': true, "topic": "Start by saying"},
        {"id": 'tennis', "topic": 'tennis', 'parentid': 'root'},
        {"id": 'basketball', "topic": 'basketball', 'parentid': 'root'},
        {"id": 'baseball', "topic": 'baseball', 'parentid': 'root'},
        {"id": 'tennis shoes', "topic": 'tennis shoes', 'parentid': 'tennis'},
        {"id": 'basketball shorts', "topic": 'basketball shorts', 'parentid': 'basketball'},
        {"id": 'tennis shoelaces', "topic": 'tennis shoelaces', 'parentid': 'tennis shoes'},
        {"id": 'tennis shoelaces shops', "topic": 'tennis shoelaces shops', 'parentid': 'tennis shoelaces'},
        {"id": "tennis shoelaces' colors", "topic": 'tennis shoelaces colors', 'parentid': 'tennis shoelaces'},
        
        {"id": 'tennis shorts', "topic": 'tennis shorts', 'parentid': 'tennis'},


    ]
};
var options = {
    container: 'jsmind_container',
    editable: true,
    mode: "full"
};

var jm = new jsMind(options);



function createRoot(main) {
mind.meta.name = main;
    if (mind.data.length != 0){
        mind.data[0].topic = main;
    }
    else{
        mind.data.push({ "id": "root", "isroot": true, "topic": main });
    }
    
    jm.show(mind);
}

//connecting parent and child nodes

function connectParent(parent){
    mind.data[mind.data.length - 1].parentid = parent;
    jm.show(mind);
}

function connectCenter(){
    mind.data[mind.data.length - 1].parentid = 'root';
    jm.show(mind);
}

//adding new topics
let direction = "right";


function appendNode(topic) {
    mind.data.push({ "id": topic, 'parentid': mind.data[mind.data.length -1].id, "topic": topic ,"direction":direction});
    jm.show(mind);
}

function appendTopic(topic) {
    if (direction == "right"){
        mind.data.push({ "id": topic, 'parentid': "root", "topic": topic ,"direction":direction});
        direction = "left";
    }
    else{
       mind.data.push({ "id": topic, 'parentid': "root", "topic": topic ,"direction":direction});
        direction = "right";
    }
    jm.show(mind);
}

function deleteNode(){
    mind.data.pop();
    jm.show(mind);
}

function deleteMap(){
    mind.data = [{"id": 'root', 'isroot': true, "topic": "New Map"}];
    jm.show(mind);
}

function saveMap(){
    jm.screenshot.shootDownload()
}

function logData(){
    console.log (mind.data); //for testing
}
var sentence;
function speakTree(object){
    sentence = "your main idea, ";
    function speakMap (object){
        if (object.children){
            sentence += object.topic + ", has " + object.children.length + " branch";
            if (object.children.length > 1){
                sentence +="es";
            }
            sentence += ": "
    
            
            for (let i = 0; i < object.children.length - 1; i++){
                sentence += object.children[i].topic + ", ";
            }
            if(object.children.length != 1){
                sentence += "and ";
            }
            sentence += object.children[object.children.length - 1].topic + "; ";
            for (let i = 0; i < object.children.length; i++){
    
                speakMap(object.children[i]);
            }
        }
    }
    speakMap(object);
    console.log(sentence);
    speak (sentence);
}

    

function mapReport(){
    var data = jm.get_data();
    console.log(data);
    speakTree (data.data);
}
    
    

createRoot ("sports");




//VOICE COMMANDS
if (annyang) {

    const commands = {
        //Adding the root node
        '(the) main idea (is) *main': createRoot,
        'Start from  *main': createRoot,
        'The main thing is *main': createRoot,
        '(the) center idea is *main': createRoot,
        //Adding second layer nodes
        '(add) new topic *topic': appendNode,
        'This connect to *topic': appendNode,
        'From there add': appendNode,
        'new idea *child': appendNode,
        //adding first layer nodes
        'new main topic *topic':appendTopic,
        //Deleting Nodes
        'Delete (what I just wrote)': deleteNode,
        'I take back what I just said': deleteNode,
        'Undo': deleteNode,
        //connecting nodes
        'connect this to (the) center': connectCenter,
        'connect (this) to *parent': connectParent,
        'This links with': connectParent,
        //deleting the whole thing
        'delete everything': deleteMap,
        'make a new map': deleteMap,
        'start over': deleteMap,
        //screenshot
        'save (the map)':saveMap,
        //for debugging
        'print out the data':logData,
        'tell me what the map looks like':mapReport
    };

    // Add our commands to annyang
    annyang.addCommands(commands);
    // Start listening.
    SpeechKITT.annyang({ autoRestart: true });

    // Define a stylesheet for KITT to use
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat-midnight-blue.css');

    // Render KITT's interface
    SpeechKITT.vroom();
}


