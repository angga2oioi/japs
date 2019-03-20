const net = require("net");
const fs = require("fs");
const japs ={
    listen:(args)=>{
        let splitted = args.f.split(":");
        if(!args.l || typeof args.l !="string"){
            args.l = "./logs";
        }
        if(!args.e || typeof args.e !="string"){
            args.e="hex";
        }
        let logStream = fs.createWriteStream(args.l, {'flags': 'a'});
        let receiver = net.createServer((socket)=> {
            let sender = new net.Socket();
            sender.connect(splitted[1], splitted[0]);
            
            sender.setKeepAlive(true);
            socket.setKeepAlive(true);

            sender.on('data', (data)=> {
                let log = "["+args.f+"-"+japs.now()+"]\n" +data.toString(args.e).replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/,'')
                + "\n";
                console.log(log);
                logStream.write(log);
                socket.write(data);
            });
            sender.on("error",(e)=>{
                console.log("error",e);
            })
            sender.on('close', () =>{
                console.log('Connection closed ',args.f);
                sender.destroy(); 
            });

            socket.on("data",(data)=>{
                let log = "[client-"+japs.now()+"]\n" +data.toString(args.e).replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/,'')
                + "\n";
                console.log(log)
                logStream.write(log);
                sender.write(data);
            });

        });
        receiver.listen(args.p ,() => {
            console.log('proxy ready at port',args.p);
        });
    },
    now:()=>{
        return new Date().toLocaleDateString('en-GB', {  
            day : 'numeric',
            month : 'short',
            year : 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }
}
module.exports = japs;

var today = new Date().toLocaleDateString('en-GB', {  
	day : 'numeric',
	month : 'short',
    year : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
})