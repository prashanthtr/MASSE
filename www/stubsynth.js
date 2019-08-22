// A custom music player that loads the mp3 sounds, and uses the timbral class
// control by the agent to trigger new, sustain, or stop the sounds.

var buffer = null; //contains the sound buffers
var context = null;

var prev_class = ""

var sounds = [
    './sounds/bongo_sustain.wav',
];

var sound = null

class Sound {

    constructor(context, buffer, id) {
        this.context = context;
        this.buffer = buffer;
        this.id = id;
    }

    get soundid() {
        return this._id;
    }

    setup(volume) {
        this.gainNode = this.context.createGain();
        //this.gainNode.gain.value = volume
        this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);

        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        //this.source.loop = true;
    }

    play(volume, dur, delay) {
        //setup and trigger a sound
        this.setup(volume)
        var ct = this.context.currentTime
        var gain = this.gainNode;
        this.source.start(ct + delay);
        gain.gain.setTargetAtTime(0, ct+dur/1000, 0.03);
        
        // setTimeout(function(){
        //     gain.gain.setTargetAtTime(0, ct+delay+2*dur/3000, 0.03);
        //     //gain.gain.exponentialRampToValueAtTime(0.001, ct+dur/2);
        // },delay+2*dur/3);
        // this.source.stop(ct+delay+dur/1000);
    }

    mute() {
        var ct = this.context.currentTime;
        //this.source.loop = false
        //this.gainNode.gain.exponentialRampToValueAtTime(0.001, ct+0.05);
        //this.gainNode.gain.value = 0
        this.source.stop(ct);
    }

}


class Buffer {

    constructor(context, urls) {
        this.context = context;
        this.urls = urls;
        this.buffer = [];
    }

    loadSound(url, index) {
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        let thisBuffer = this;
        request.onload = function() {
            thisBuffer.context.decodeAudioData(request.response, function(buffer) {
                thisBuffer.buffer[index] = buffer;
                if(index == thisBuffer.urls.length-1) {
                    thisBuffer.loaded();
                }
            });
        };
        request.send();
    };

    loadAll() {
        this.urls.forEach((url, index) => {
            this.loadSound(url, index);
        });
    }

    loaded() {
        // what happens when all the files are loaded
        console.log("all sounds are loaded");
    }

    getSoundByIndex(index) {
        return this.buffer[index];
    }

    getSoundByName(name) {
        var index = sounds.indexOf(name);
        return this.buffer[index];
    }

}


//let context = new (window.AudioContext || window.webkitAudioContext)();

export function synth_context1 (acontext){
buffer = new Buffer(acontext, sounds);
buffer.loadAll();
context = acontext;
}

//var play = {}

export function sel_rand_sound1 (){
    return sounds[Math.floor(Math.random()*sounds.length)];

}

export function playsound1 (  ){
    //needs the timbre class and volume to

    //console.log("stop " + stop)
    //console.log("volume " + volume)
    //console.log(timbre_class);

    return function( timbre_class, volume, stop, delay, dur ){

        if( (!timbre_class || stop == 1) ){
            if (sound) sound.mute();
            return;
        }

        //start a new sound
        sound = new Sound(context, buffer.getSoundByName(timbre_class));

        //starts a source node with sound buffer, plays it for a duration and
        //terminates it

        //console.log("scheduling " + timbre_class)
        sound.play(volume, dur, delay)

        prev_class = timbre_class
        return 1;

    }
};
