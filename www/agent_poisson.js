
//agent that responds to stability and togetherness based on comprov score
import * as utils from "./utils.js"

//Control agent that uses density as input, and uses a poisson processes for decision making

//agent that responds to stability and togetherness based on comprov score

export var agent_c = function ( constraints ){

    var agent = {}

    agent.internal_sequences =[]
    //agent.external_sequences =[]
    //agent stores only the last sixteen beats
    agent.external_sequences = "0000000000000000";
    agent.response = "0000000000000000"
    agent.last_played = []
    agent.constraints = constraints;
    agent.density = 0;
    agent.t_since_last_hit = 0;

    // lisntes every period to gather input from environment
    // listens every period to update any new event that happened in the last beat
    // to update the external sequence
    // input: sequence of 16 hits
    // index : beat number within  16 hits

    agent.listen = function( input, ind ){

      //var hit = (function(input){ return parseFloat(input)>0.1?1:0 })(input); // process converts intensity into binary hit/miss

        var value = input[ind];
        console.log("value is " + value)
        agent.external_sequences = utils.setCharAt(agent.external_sequences, ind, value);
        //agent.external_sequences.push(hit);
        return agent.respond(agent.external_sequences, ind); //send the current value of sequence
    }

    //it is not interveent, but only number of events in given time
    // in this case, number of hits in a bar
    function interevent_arrival ( events ){

        // var iea = [];
        // var last_event = 0;
        // for (var i = 0; i < events.length; i++) {
        //     if( events[i] == 1){
        //         //finding the arrival time between current event and the last
        //         iea.push(i - last_event);
        //         last_event = i;
        //     }
        // }
        // if( iea.length == 0 ){
        //     //silence
        //     return 0;
        // }
        // else{
        //     //var lambda = iea.reduce(function(a,b){return a+b})/iea.length;
        //     var lamda = 0.5;
        //     return lambda;
        // }

        //numbet of hits in a bar, varies from 0 to 1
        var event_arr = events.split("").map(function(s){return parseFloat(s);});
        console.log(event_arr);
        var n_hits = event_arr.reduce(function(a,b){return a+b});

        var lambda = n_hits/16;
        return lambda;
    }

    function gen_hit (){

        var hit_cutoff =  (1 - Math.exp(-agent.density*agent.t_since_last_hit))
        //console.log("hit cut off " + hit_cutoff);
        var hit_not = "0";

        //the probability that a random sample belongs to the cumultative distribution
        // first arrival is within the cut off
        if(Math.random() < hit_cutoff){
            hit_not = "1";
            agent.t_since_last_hit  = 0;
        }
        else{
            //1 time unit has lapsed
            agent.t_since_last_hit++;
        }
        return hit_not;
    }


    // input comes from the listening loop
    agent.respond = function( ext_seq, ind ){

        //console.log("ind is " + ind)
        
        if( ind == 0){
            console.log("ext seq " + ext_seq)
            // the beginning of the bar where the agent makes a split second
            // decison to reveal its commitment to particular rhythmic aspect of
            // the input
            if( ext_seq == "0000000000000000" ){
                agent.response = "0000000000000000";
                agent.last_played = "0000000000000000";
                agent.density = 0
                console.log("returning 0")
                return "0";
                //the agent remains silent if the musician has not played at all
            }
            else{
                // The agent selects a new pattern to reveal its commitment
                console.log("selecting new pattern")
               //set hit generation parameters
                agent.density = interevent_arrival(ext_seq);
                agent.t_since_last_hit = 0; 
            }
        }
        // agent generates a hit based on the current density, and the state
        var hit = gen_hit();
        return hit;

    }

    return agent;

}
