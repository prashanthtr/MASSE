
import {js_clock} from "./clocks.js"

let beats = 0;
let tick_int = 250; //1000/2

//phasor that ticks before the clock
var play;
var listen;
var metron = null;
var beat_ctr = 0;

var listen_counter = 0;
var metron = 0;

var m_beat = 0;
var l_beat = 0;
var p_beat = 0;

var rafId = null;

function drawLoop(){

    let now = Date.now();

    //agent always listens first to update the input
    //press a key once between any 2 ticks and find a note hit immediately

    // metron(now, function(){
    // 	  m_beat += 1/4;
    //     if( m_beat == 0.25 || m_beat % 1 == 0){
   	// 	 	    document.getElementById("seq").innerHTML += "METRONOME: " + m_beat + "<br>"
    //    	}
    // })();

    listen(now, function(){
    	  console.log("listen")
        document.getElementById("seq").innerHTML += "listen: " + p_beat +  "<br>"
    })();

    play(now, function(){

		    console.log("play")
        p_beat += 1
        document.getElementById("seq").innerHTML += "play: " + p_beat +  "<br>"
        if( p_beat % 2 == 0){
            document.getElementById("seq").innerHTML += "METRONOME: " + p_beat + "<br>"
        }

    })();

	  rafId = requestAnimationFrame(drawLoop);
}

window.addEventListener("keypress", function(c){

	  console.log("char code" + c.keyCode)

    if( c.keyCode == 115){
        listen = js_clock(20, 16);//listen updates that fast
        play = js_clock(40, 4);
        metron = js_clock(20, 16);
        document.getElementById("seq").innerHTML += "METRONOME: " + p_beat + "<br>"
        drawLoop();
    }

	  if( c.keyCode == 114){
	      cancelAnimationFrame(rafId);
		    rafId = null;
	  }

});
