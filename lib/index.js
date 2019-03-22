const net = require("net");
const fs = require("fs");
const global_header = Buffer.from("A1B2C3D4000200040000000000000000FFFFFFFF00000001", "hex");

const japs =()=>{
    String.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }
    const createPacket = (data)=>{
        let Now = new Date().getTime();
        let timestampSeconds = Math.floor(Now/1000).toString(16).pad(8);
        let timestampMicroseconds = ((Now % 1000) * 1000).toString(16).pad(8);
        let capturedLength = (data.length).toString(16).pad(8);
        let originalLength = data.length.toString(16).pad(8);

        let packet_header = Buffer.from(timestampSeconds + timestampMicroseconds + capturedLength + originalLength,"hex");
        let totalLength = packet_header.length + data.length;
        return Buffer.concat([packet_header, data], totalLength);

    }
    const ipvToHex=(ip)=>{
        let parts = ip.split(":");
        ip = parts[parts.length -1];

        let temp = ip.split(".");
        let result = "";
        temp.forEach((v)=>{
            result += parseInt(v).toString(16).pad(2);
        });
        
        return result;
    }
    const createData = (socket,raw)=>{
        let source_ip = ipvToHex(socket.localAddress);
        let dest_ip = ipvToHex(socket.remoteAddress);
        
        let source_port=socket.localPort.toString(16).pad(4);
        let dest_port=socket.remotePort.toString(16).pad(4);

        let data_head = source_ip+source_port + dest_ip + dest_port;
        let data_header = Buffer.from(data_head ,"hex");
        let data_length = raw.length + data_header.length;
        let newData = Buffer.concat([data_header, raw], data_length);
        
        return newData;
    }
    const listen = (args)=>{
        let splitted = args.f.split(":");
        let isExists = fs.existsSync("./log.pcap");
        let logStream = fs.createWriteStream("./log.pcap", {'flags': 'a'});

        if(!isExists){
            logStream.write(global_header);
        }
        let receiver = net.createServer((socket)=> {
            let sender = new net.Socket();
            sender.connect(splitted[1], splitted[0]);
            
            sender.setKeepAlive(true);
            socket.setKeepAlive(true);
            
            sender.on('data', (data)=> {
                let newData = createData(sender,data);
                let log = "["+sender.localAddress+"-"+now()+"]\n" +newData.toString("hex").replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/,'')
                + "\n";
                console.log(log);
                logStream.write(createPacket(newData));
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
                let newData = createData(socket,data);
                let log = "["+socket.localAddress+"-"+now()+"]\n" +newData.toString("hex").replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/,'')
                + "\n";
                console.log(log);                

                logStream.write(createPacket(newData));
                sender.write(data);
            });

        });
        receiver.listen(args.p ,() => {
            console.log('proxy ready at port',args.p);
        });
    }
    const now=()=>{
        return new Date().toLocaleDateString('en-GB', {  
            day : 'numeric',
            month : 'short',
            year : 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }
    
    return {
        listen:listen,
    }
}
module.exports = japs();