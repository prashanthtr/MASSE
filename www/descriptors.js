
// Features considered
// Division of meter
// Metrical accents
//  - missing downbeat, missing strong accent, number of weak accents,
// Repetition of doublets
//

// Other features (within 2 bars)
// interset onset intervals (variance)
// time signature
//


function symbolic_map( str ){

    if( str == "1000"){
        return "q"
    }
    else if( str == "1010"){
        return "ee"
    }
    else {

        var pat = ""
        for (var i = 0; i < str.length-1; i+=2) {
            if( str[i] + str[i+1] == "10" || str[i] + str[i+1] == "00"){
                pat+="e"
            }
            else{
                pat+="ss"
            }
        }
        return pat;
    }
}

//console.log(symbolic_map("1010000"));

// Rhythms description functions

//Decribes rhythms based on whether they are equally divided or not in terms of metrical subdivisions
// input: ["q,ee"]/ ["q,q"]
// output: "UED", "ED"
// UED : unequally divided, ED: equally divided

function doubletDesc( singlets ){

    var singlet1 = symbolic_map(singlets[0])
    var singlet2 = symbolic_map(singlets[1])

    if( singlet1 == singlet2){
        return "ED";
    }
    else{
        return "UED";
    }
}

function doublet_analysis(bar){

    var doublet_desc = [];

    for (var i = 0; i <= bar.length-4; i+=8) {
        var singlets = []
        singlets.push( bar.slice(i, i+4));
        singlets.push( bar.slice(i+4,i+8));
        var desc = doubletDesc(singlets);
        //console.log( r + "  " + singlets + " " + desc);
        doublet_desc.push(desc);
        //+= desc + " "
    }
    return doublet_desc;
}


// Describes doublets in the bar based on whether they are
// Missing downbeat
// Accented positions wrt strong beats
// Syncopation
// Repetition of doublets
// "input:" [00010001]
// Output: MDown, NAc, 2-Syn, Rep.,
// Missing downbeat, Non accented , 2 Sycnopated notes, Repetition of doublets

export function barDesc (bar){

    //a bar is made of doublets
    var S1 = doublet_analysis(bar);
    var D1 =  missing_downbeat(bar);
    var D2 = missing_strongAccent(bar);
    var D3 = weak_accents(bar);
    var D4 = repetition(bar); //repetition of doublets in the bar
    //swing(doublets); not used
    return [D1, D2, D3, D4, S1];
    //return S1 + ", " + D1 + ", " + D2 + ", " + D3 + ", " + D4;

}

// Rhythm descriptors calculation

// Input: "01111111"  Output: missing downbeat
// Input: "10000000"  Output: downbeat
function missing_downbeat( bar ){

    if( bar[0] == "0"){
        return "Mis.Downbeat"
    }
    else{
        return "Downbeat"
    }
}

// Input: "01111111"  Output: not Missing strng accent
// Input: "10000000"  Output: missing strong accent
function missing_strongAccent( bar ){

    var mid = Math.floor(bar.length/2)+1
    if( bar[mid] == "0"){
        return "Mis.SA"
    }
    else{
        return "SA"
    }
}

// "input:" [00010001]
// 2 Weak Accents just before the SA, and missing downbeat

// Syncopation index that counts and weights the number of syncopated notes in a bar
// For 8 eighth note 4 bar rhythms
function weak_accents ( binary  ){

    var weights = [0,-4,-3,-4,-2,-4,-3,-4,-1,-4,-3,-4,-2,-4,-3,-4];

    var si = 0 ; //syncopation index

    for (var i = 0; i < binary.length; i++) {

        if( i == 0 ) var prev = binary.length-1
        else var prev = i - 1;

        if( binary[i] == 0 && binary[prev] != 0 && weights[prev] < weights[i]){
            if( weights[i] - weights[prev] >= 0){
                si += 1; // make them unweighted just for getting the weak accents
            }
        }
    }
    if( si == 0){
        return "Mis.WeakAc"
    }
    else{
        return si +" WeakAc"
    }
}


//Counts repetition of doublets in a bar
// "input:" "00010001"
// Output: MDown, NAc, 2-Syn, Rep.,
function repetition ( bar) {

    var doublet1 = bar.slice(0, bar.length/2)
    var doublet2 = bar.slice(bar.length/2, bar.length)
    if( doublet1 == doublet2){
        return "Rep"
    }
    else{
        return "NRep"
    }
}
