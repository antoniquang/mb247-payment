const express = require("express");
const app = express();
const axios = require('axios');
const cors = require("cors");
const cron = require("node-cron");
const mysql = require("mysql2");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 86400000,
    pingInterval: 1000,
    cors: {
        origin: '*',
    }
});

server.listen(process.env.PORT || 3000);


const url = 'http://diendengiadung.com/api_mb247/api/index.php';
const token='b2x5bXAxNjhAZ21haWwuY29tOkAxMjNANDU2'
var arr_socket_id=[];

io.on('connection', function(socket) {
    console.log(socket.id + "connect thành công");
    console.log(arr_socket_id);
    socket.on('create_receive',data=>{
        console.log("tạo thanh toán")
        console.log(data);
        arr_socket_id.push({id_customer:data.id_customer,platform_number:data.platform_number});
    });
    socket.on("join_room",data=>{
        console.log("join room");
        console.log(data);
        socket.join(data.id_customer);    
    })
});


//io.emit('notify_receive', {success:"true"});

setInterval(function(){
    console.log("Thanh toán");
        var data_api = { 
                    detect:"thanhtoantructiep",
                    type_manager:"check_status_all"
             }; 
        var url_api=url+"?detect=thanhtoantructiep&type_manager=check_status_all"      
        axios.post(url,data_api, {
            headers: {
                'Authorization': 'Basic '+token,
            },
        }).then((res) => {
            console.log(res.data);
            list_customer=res.data.list_customer;
            if(list_customer!=null)
            {
                list_customer.forEach(element => {
                    io.to(element.id_customer).emit('notify_receive', {success:"true",message:"Thanh toán thành công",amount:element.amount});
                });
            }
            
            //
        }).catch((error) => {

        })
},60000)

setInterval(function(){ 
    console.log("Hoàn tiền");
    var data_api = { 
                    detect:"hoantientructiep",
                    type_manager:"check_status_all"
             };       
        axios.post(url,data_api, {
            headers: {
                'Authorization': 'Basic '+token,
            },
        }).then((res) => {
            console.log(res.data);
            if(res.data.flag=="true")
            {
                io.emit('notify_payment', {success:"true",message:"Hoàn tiền thành công"});
            }
            
            

        }).catch((error) => {

        })
},100000);

app.get("/", function(req, res) {
    res.render("index");
});

