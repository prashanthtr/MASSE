
// Tale of ticking clocks:
// lower number clocks are called before the higher number clocks

// a javascript abstraction to generate clocks

// clocks listens to the passage of time and takes in a function that is
// callbacks and returns a function that gets executed in context

// The standard clock function as 1 second
// The scheduler takes in two arguments:
// 1) rate at which the clock wrt to the 1 seconds /number of times that the function is called in 1 second,
// 2) callback function


//customized clock for timing control
// how are the clocks synchronized

export function js_clock ( latency , r ){

    var then = Date.now();
    var interval = Math.floor(1000/r);
    var lookahead = latency; //as low 1 frame (~50ms in my computer ! :( ))

    return function(now, cb){

        var delta = now - then;

        if( delta > interval ){
            then = now - (delta % interval); //look back
            console.log("Exceeded")
            return function(){}
        }
        else if( delta > interval - lookahead){

            then = then + interval
            return cb;
        }
        else{
            return function(){}
        }
        //return 0;
    };
}
