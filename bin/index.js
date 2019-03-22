#!/usr/bin/env node

const proxy= require("./../lib/index.js");
let argv =process.argv.slice(2);
let params={};
argv.forEach(function(v){
    let split = v.split("=");
    let opt = split[0].replace(/-/g,"");
    if(split.length==1){
        params[opt]=true;
    }else{
        params[opt]=split[1]
    }
})
if(params.h===true){
	console.log("USAGE : ");
	console.log("\t japs [option]");
    
    console.log("REMARKS : ");
    console.log("\t Captured package will be saved in log.pcap");
    
	console.log("Option : ");
	console.log("\t -h  \t Show this help, no option needed");
	console.log("\t -p \t Set port to listening to");
	console.log("\t -f \t Set server:port to forward to");
	
	console.log(" ");
	console.log("Example : ");
	console.log("\t japs -p=1234 -f=localhost:3306");
	return;
}
if(!params.p || typeof params.p !=="string"){
    console.log("Error, please set port to listen to")
    return;
}
if(!params.f || typeof params.f !=="string"){
    console.log("Error, please set server:port to forward to");
    return;
}
proxy.listen(params);
