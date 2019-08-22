
// both stability and togetherness are maximum

//source file that I am editing for agent testing

// for the agent used in the study

import * as utils from "./utils.js"
// import {barDesc} from "./descriptors.js"
import {js_clock} from "./clocks.js"
// import {fitch_rhythms} from "./fitch_rhythms.js"
// import {generate_swap_rhythms} from "./shift_rhythms.js"
import { playsound, synth_context } from "./synth.js"
import { playsound1, synth_context1 } from "./stubsynth.js"
import { playsound2, synth_context2 } from "./synth3.js"
// import {source_lead, source_acc} from "./demo_examples.js"

//highest smoothness/lowest elaboration score and lowest syncopatiion index
//var agent = agent_c({min: 0, max: 0.33});

// logging the hits along with the time stamp of the musician
//
// [ { beats: "n", musician: [], system: []}];
var logging = [];
var system_last_response = "0"
var last_midi = 0;

var url = window.location.pathname;

// the time that musician played hte input
var abs_musician = 0;

// the time that beat was sounded/agent time
var abs_beat = 0;

var audioContext = null;
audioContext = new AudioContext();

console.log(audioContext.baseLatency*1000)

var hi_hit = './sounds/bongo_sustain.wav';
var low_hit =  './sounds/tum-2-beats.m4a';
var metronome =  './sounds/metronome.wav';

// var maxlen = fitch_rhythms.length-1;
var rafId = null;

//2 synth functions
var playBaseSound = playsound();
var playHighSound = playsound1();
var playMetSound = playsound2();

let beats = -1;

//Each tick corresponds to a sixteenth note and is 250ms
// Each tick corresponds to a eighth note and is 250ms
// smallest unit has to be sixteenth notes
let tick_int = 200; //1000/2

//phasor that ticks before the clock
var play;
var listen;
var metron = null;
var beat_ctr = 0;
var last_note_set = 0;

var maxBeats = 256;
var phasor_interval = 4;

var listen_counter = 0;
var set_early = 0; //setting the listener value earluer than it is registereedf
var wait_to_set = 0;
var set_early_obj= "0";

//two event types deteced by the keybaord listener
var last_event = Date.now()
var event_type = 0;
var notePressed = false;


// var inputBar = source_lead[0];
// var system_response = source_acc[0];

var userInput = "0000000000000000"
var systemInput = "0010001000100010"

var system_rhythms = [];

//generate doublets in eighth note representation
var doublets = utils.binaryRhythms([], 4);

// one bar rhythm patterns with doublet patterns
var bars = []
for (var i = 0; i < doublets.length; i++) {
    for (var j = 0; j < doublets.length; j++) {
        bars.push(doublets[i] + doublets[j]);
    }
}

// var descriptors = []

// //dynamically generate descriptions and score
// function gen_and_score ( inputBar ){

//     descriptors = []
//     for (var i = 0; i < bars.length; i++) {

//         var desc = barDesc(bars[i]);
//         var score = scoring.fd_score(desc);

//         var bar_arr =  bars[i].split("").map(parseFloat);

//         inputBar = inputBar;
//         var combined = utils.combine_rhythms( bars[i], inputBar);
//         var combined_arr =  combined.split("").map(parseFloat)

//         var c_desc = barDesc(combined);
//         var comb_score = scoring.fd_score(c_desc);

//         descriptors.push({"rhythm": bars[i], "score": score, "comb_score": comb_score});

//         var str = bars[i]+ "," + combined + "," +
//             score+ "," +  comb_score+ ",";
//     }
// }

function drawLoop(){

    let now = Date.now();

    //the metronome is plaued at the end of all the decisions made by the agent
    // and the beat is rung
    // once the beat is rung, it signals the start of a new phase of the current beat
    //
    // metron( now, function(){

    //     console.log("beat inc" + beats)
    //     beat_ctr += 0.25;
    //     // after the immediate downbeat
    //     if( beat_ctr == 0.25 || beat_ctr % 2 == 0){ //every 1 seconds, half bar
    //         var met_click = [1,metronome,0.1,0,2];
    //         playMetSound(met_click[1] , met_click[2], 0, 0, met_click[4]*0.5*tick_int);
    //     }

    // })();


    //agent always listens first to update the input
    //press a key once between any 2 ticks and find a note hit immediately
    listen(now, function(){

        //beats has to be greater than 0 so that listening does not start until
        //the first time playing starts. Thus, they update notes together.

        if(beats>= 0){
            console.log("listen")
            var ind = (beats)%16; //16 is the maximum hits

            //time just after the threshold interval for listening was passed checks
            //if there was an event before the threshold was crossed or even within
            //the threshold window the mouse was pushed

            // there could be case where it was updated but not played, so listen
            // should have a higher window of delay compared to play?

            // At the onset of the beat, the counter checks if there the key has
            // been pressed before the onset. If a key is pressed, then
            // set_early is 1. This is used to set the note at the correct beat
            // position.
            if(listen_counter % 1 == 0 ){

                //no change
                //notePressed = false;
                if( set_early == 1){
                    ind = beats%16
                    userInput = utils.setCharAt(userInput, ind, "1");
                    set_early = 0;
                    last_note_set = 1;
                }
                else{

                    //if the hit was not played by the onset, there is still a
                    //chance that it might be played after the onset. We are
                    //allowing for a small window where musician plays the hit
                    //slightly after the onset. This is stored in wait-to-set.
                    //When wait-to-set is 1, the system is still waiting to
                    //register the hit that will occurr immediately.
                    wait_to_set = 1;
                }

                //initialize  early object to 0
                //console.log("setting " + set_early_obj + " at " + beats);
                //userInput = utils.setCharAt(userInput, ind, set_early_obj);
            }
            else if( listen_counter % 1 == 0.25){ // phase 1

                //The system is in the first phase after the onset. A new event
                //may occur due to a mistitming just after the onset.

                //A new event has not occurred, and the system no longer
                //needs to wait for a new event. So wait-to-set is set to 0
                //anyway
                //wait_to_set = 0;
                if( notePressed == true && wait_to_set == 1){
                    //A new event occurs just after the onset.
                    // create the object that was just registered in the press
                    var ind = beats%16
                    console.log("setting 1 at " + beats)
                    userInput = utils.setCharAt(userInput, ind, "1")
                    notePressed = false;
                    wait_to_set = 0;
                    last_note_set = 1;
                    console.log("note is set")
                    console.log("listne ctr" + listen_counter + " beat" + beats)
                }
                else{
                    //no longer wait for a new note
                    wait_to_set = 0;
                }

            }
            else if(listen_counter % 1 == 0.5 ){
                //nothing happens for now
                if( last_note_set == 1){
                    // last note has already been set with early events or a late event
                }
                else{
                    var ind = beats%16
                    userInput = utils.setCharAt(userInput, ind, "0");
                }
                last_note_set = 0;

                //now is a good time to log the last beat as no new events can change the past
                var user_response = userInput[beats%16]; //in order to input into the system
                logging.push({"beats": beats, "abs_musician": abs_musician, "musician" : user_response , "system": system_last_response, "abs_agent": abs_beat});

                //console.log("pressed");
            }
            else{ // if listen counter is >= 0.75
                //we are in the third phase in which the user may play a note
                //earlier than it has to be sounded.
                if( set_early == 1){

                    // The user has already played the hit in the previous phase
                    //period and set the note to 1. No action needs to be taken
                    //now. do nothing

                }
                else{
                    // The userpresses the hit in the third phase. This hit is
                    // meant to be sounded at the onset of the next beat, but
                    // due to timing issues, user presses it slightly before.
                    if( notePressed == true && set_early == 0){

                        //set eearly oibject is a note hit
                        //set_early_obj = createControlledSoundObj({event_yes: 1, type: event_type, velocity: 0.5});
                        //set_early_obj = "1";
                        //userInput = utils.setCharAt(userInput, ind, "1");
                        set_early = 1;
                        notePressed = false; //in this way even if a new note is pressed simultaneously, it wont be registered if it is in a small succession
                    }
                    else{

                        //set early obj is silence
                        // this could mean that the user
                        // has not yet played a note in this phase.
                        set_early_obj = 0;
                        //userInput = utils.setCharAt(userInput, ind, "0");
                    }
                    //no change to ind
                    //update the stored source

                }
            }

            //console.log("pushed")
            //and keyboard is pushed or not pushed now?
            //lookback time of 50 seconds
            //giving a huge window
            //last_event > time - 1000/4 + 50 &&  last_event < time &

            listen_counter+= 0.25;

        }

    })();

    //play is at the first, and teh first note is a 0 as it is listening
    // however, what this means is that the agent listens to what ever is played on the first beat,
    // and the beat is 1 at the time the agent's listen module triggerred
    play(now, function(){

        console.log("play")

        // at the end of play functin, the beat is completley over
        // play is called at the end of all the cycles of the beat
        beats = (beats+1);

        if( beats % 8 == 0){
            var met_click = [1,metronome,0.05,0,2];
            playMetSound(met_click[1] , met_click[2], 0, 0, met_click[4]*0.75*tick_int);
        }

        if( beats % 4 == 0){
            var met_click = [1,metronome,0.02,0,2];
            playMetSound(met_click[1] , met_click[2], 0, 0, met_click[4]*0.75*tick_int);
        }


        //var userInput = document.getElementById("userInput").value
        console.log("starting beat " + beats);

        // if(  beats% 8 == 0){
        //     //start of bar
        //     var met_click = [1,metronome,0.1,0,2];
        //     playMetSound(met_click[1] , met_click[2], 0, 0, met_click[4]*tick_int);
        // }


        // if the note on is set to 1 before the system's play loop
        //if( midi.note_on == 1){
        //    userInput = utils.setCharAt(userInput, beats%16, "1")
        //}
        //else{
        //    userInput = utils.setCharAt(userInput, beats%16, "0")
        //}
        //midi.note_on = "0"

        console.log("input sequence : " + userInput)
        document.getElementById("userInput").value = userInput;

        var system_response = systemInput[beats%16];

        //console.log(system_response)
        //var system_sounds = utils.binary2Rhythms( system_response , low_hit );


        // if the play function is triggerred on/after the first phase, then
        // if the play is triggerred before the last phase,
        var user_response = userInput[beats%16]; //in order to input into the system

        console.log("sending " + userInput[beats%16] + "to the agent");
        //var system_response = agent.listen(userInput, beats%16);

        //console.log(system_response)
        //var system_sounds = utils.binary2Rhythms( system_response , low_hit );

        var system_out = utils.binary2Hit(system_response, low_hit)
        //var user_out = utils.binary2Hit(user_response, hi_hit)

        //system_sounds[beats%16]; //maxBeats

        //console.log(system_response);
        //var user_sounds = utils.binary2Rhythms( userInput , hi_hit );

        //logs the users last hit
        // logs the systems last response for the hit
        //w user_response hat the user played in the last beat
        //  system last response is what the system played in last beat
        // system response is what the system is playing now based on the past.


        if( system_out[0] == 1) {
            playBaseSound(null , 0, 1, 0, 1);
            playBaseSound(system_out[1] , system_out[2], 0, 0, system_out[4]*tick_int);
        }

        listen_counter = 0;

        system_last_response = system_response
        abs_beat = audioContext.currentTime; //current time before moving the time to correspond to the next beat.
        if( user_response == "1"){
            //use the value of the hit that has been struck early or will be struck late
        }
        else{
            abs_musician = abs_beat;
        };

        // if( user_out[0] == 1 ) {
        //     //playHighSound(null , 0, 1, 0, 1);
        //     //playHighSound(user_out[1] , 0.15, 0, 0, user_out[4]*tick_int);
        //     //midi.note_on = 0;
        // }
        //leading trail of the playing
    })();


    rafId = requestAnimationFrame(drawLoop);
}

var old_now = Date.now();
var start = document.getElementById("start");

window.addEventListener("keypress", function(c){

    console.log("char code" + c.keyCode)

    if( c.keyCode == 115){

        audioContext.resume().then(() => {
            console.log('Playback resumed successfully');
        });
        synth_context(audioContext); //load sounds
        synth_context1(audioContext);
        synth_context2(audioContext);

        var filename = window.location.pathname;
        window.localStorage.setItem(filename, "");

        listen = js_clock(30, 20);//listen updates that fast
        play = js_clock(20, 5);
        abs_beat = audioContext.currentTime;
        //metron = js_clock(30, 16);
        //playMetSound(metronome,1,0,0,500);
        //start play once
        // play( old_now, function(){
        //     console.log("play once")
        //     var met_click = [1,metronome,0.1,0,2];
        //     playMetSound(met_click[1] , met_click[2], 0, 0, met_click[4]*0.5*tick_int);
        //     //wihtout incrementing hte bets beats = beats+1;
        // })();
        drawLoop();

    }

        if( c.keyCode == 114){
          cancelAnimationFrame(rafId);
                rafId = null;
          playHighSound(null,0,0);
        var filename = window.location.pathname;
        window.localStorage.setItem(filename, logging.map(function(l){return JSON.stringify(l)}).join("\n"));
      }

    // if( c.keyCode == 107){
    //     //var val = parseFloat(document.getElementById("cc").value)
    //     var val = parseFloat(document.getElementById("complexity_val").value)
    //     document.getElementById("complexity_val").value = val>0?val-1:val;

    // }

    // if( c.keyCode == 108){
    //     var val = parseFloat(document.getElementById("complexity_val").value)
    //     val = val>= source_acc.length-1?val:val+1;
    //     document.getElementById("complexity_val").value = val
    //     //document.getElementById("complexity_val").value = document.getElementById("cc").value;
    //     //document.getElementById("userInput").value = fitch_rhythms[val][0];
    //     console.log(val)
    // };

});

// function playSound(buffer, time) {
//   var source = audioContext.createBufferSource();
//   source.buffer = buffer;
//   source.connect(audioContext.destination);
//   source.start(time);
// }

// function loadSounds(url, ind) {
//   var request = new XMLHttpRequest();
//   request.open('GET', url, true);
//   request.responseType = 'arraybuffer';

//   // Decode asynchronously
//   request.onload = function() {
//     audioContext.decodeAudioData(request.response, function(buffer) {
//         sounds[ind].buffer = buffer;
//     }, function(){console.log("error")});
//   }
//   request.send();
// }

if( navigator.requestMIDIAccess) {
    console.log("supports midi")
}
else{
    console.log("No web midi")
}


navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess){
    console.log(midiAccess)
    var inputs = midiAccess.inputs
    var outputs = midiAccess.outputs
    for(var input of midiAccess.inputs.values()){
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure (){
      console.log("Not access midi devices")
}


function getMIDIMessage (midiMessage){
      console.log(midiMessage);

      var command = midiMessage.data[0]
      var note = midiMessage.data[1]
      var velocity = midiMessage.data.length > 2? midiMessage[2] : 0
      abs_musician = audioContext.currentTime;

      if( command == 144){
            //velocity
            //midi play
        if( midiMessage.timeStamp - last_midi <= 100){
            console.log("here")
        }
        else{
            notePressed = true
            var user_response = 1;
            var user_out = utils.binary2Hit(user_response, hi_hit)
            //playHighSound(null , 0, 1, 0, 1);
            playHighSound(user_out[1] , 0.5, 0, 0, user_out[4]*tick_int);
            last_midi = midiMessage.timeStamp;
        }

      }

      // if( command == 128){
         //    //velocity
         //    notePressed = false
      // }

      // if( velocity == 0){
         //    notePressed = false
      // }

}



// document.getElementById("cc").addEventListener("input", function(e){
//     document.getElementById("complexity_val").value = e.target.value;
// });

// //index to select one of the generated secondary rhythms
// document.getElementById("cc_goal").addEventListener("input",function(e){
//     system_rhythms = [];
//     system_rhythms = generate_swap_rhythms(document.getElementById("userInput").value);
// });

//system_rhythms = generate_swap_rhythms(document.getElementById("userInput").value);
