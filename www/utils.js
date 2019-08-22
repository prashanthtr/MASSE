


// Generate binaries
// Input: 2.
// output: ["00","01","10","11"]
export function binaryRhythms ( arr , length ){

    for (var i = 0; i < Math.pow(2,length); i++) {
        var binary_str = (i).toString(2)
        var bstr = gen_ones(length-binary_str.length, "0") + binary_str;
        arr[i] =  bstr.split("").map(parseFloat).join("");
        //console.log(bstr.slice(0,4) + "-" + bstr.slice(4,bstr.length));
    }
    return arr;
}


// fill remaining string with with 0s given a lenght
export function gen_ones( n, fill ){

    var i = 0
    var str = ""
    while(i < n){
        str+= fill;
        i++;
    }
    return str;
}




// Maps strings of 1s and 0s to a system of qs and es
// Regular expression mapping
// need to change this for polyrhythms
export function mapping( str ){

    if( str == "01" || str == "10"){
        return "ee"
    }
    else{
        return "q"
    }

}


//Describes every singlet in an array of singlets
// Input : ["11","10","00"]
// Output: ["ee", "ee", "qq"];
export function arr2Singlet( r ){

    // 00, 10 is a quarter note
    // 11 or 01 is an eight note

    var mappedSinglet = [];
    for (var i = 0; i < r.length-1; i+=2) {
        var str = r[i] + r[i+1];
        mappedSinglet.push(mapping(str));
    }
    return mappedSinglet;
}

export function bubble_sortArr(arr, ind){
    console.log(arr)

    for (var i = 0; i < arr.length; i++) {
        for (var j = i+1; j < arr.length; j++) {
            if( arr[j][ind] < arr[i][ind]){
                var temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp;
            }
        }
    }
    console.dir(arr, {'maxArrayLength': null});
}


//utility
export function combine_rhythms ( rhythm1, rhythm2){

    rhythm1 = rhythm1.split("").map(parseFloat);
    rhythm2 = rhythm2.split("").map(parseFloat);

    var combined = rhythm1.map(function(r1,ind){
        var r2 = rhythm2[ind];
        if( r1 == 1 || r2 == 1){
            return 1
        }
        else{
            return 0 // an empty note
        }
    });

    return combined.join("");
}

// get an array rom binary sequence
export function binary2Rhythms ( bin_seq, HIT ){

    return bin_seq.split("").map(function(bs){
        if(bs == "1" || bs != "0"){
            let sign = Math.random() > 0.5 ? 1 : -1;
            let intensity = 0.4 + sign*0.25*Math.random(); //so that it stays more than 0
            return [1,HIT,intensity,0,1];
        }
        else{
            return [0,"",0,0,1]
        }
    });
}


// get a playable hit from binary value
export function binary2Hit ( bs, HIT ){
    //bs == "1" || bs != "0" 

    if( (bs == "1" || bs != "0" ) || (bs == 1 || bs != 0)){
        let sign = Math.random() > 0.5 ? 1 : -1;
        let intensity = 0.4; // + sign*0.25*Math.random(); //so that it stays more than 0
        return [1,HIT,intensity,0,1];
    }
    else{
        return [0,"",0,0,1]
    }

}

export function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}