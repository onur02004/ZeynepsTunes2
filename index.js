const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const{ Server }= require('socket.io');
const io = new Server(server);
const port = process.env.PORT || 3100;
const readline = require('readline');
const fs = require('fs');
const path = require('path');

app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Port Aciliyo: ${port}`);
    
});

let users = [];
let hazir_user_count = 0;


io.on('connection', (socket) => { 
    console.log('User Connected With Id==>' + socket.id);

    socket.on('Ilk_Baglanma', (ms) => {
        console.log('yeni biri online: ' + ms.name);
        socket.broadcast.emit('Ilk_Baglanma', ms.name);

    });

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    
        // Find and remove the disconnected user from the JSON variable
        users = users.filter((user) => user.socketId !== socket.id);
        io.emit('resetList');
        users.forEach(element => {
            io.emit('userList', define_User_Name_Class = {  
                name: element.name,
                imageName: element.imageName,
                socketId: element.socketId,
            });
        });
    });
    socket.on('define_User_Name', (ms) => {

        console.log("Yeni Birisi:" + ms);



        let name = ms.name;
        let imageName = ms.imageName;
        let socketId = socket.id;


        users.push({
        name,
        imageName,
        socketId,
        });
        io.emit('resetList');
        users.forEach(element => {
            io.emit('userList', define_User_Name_Class = {  
                name: element.name,
                imageName: element.imageName,
                socketId: element.socketId,
            });
        });


        
    });
    socket.on('Leave_Room', (ms) => {
        users = users.filter((user) => user.socketId !== socket.id);
        
        socket.broadcast.emit('Leave_Room', ms);
        console.log("Odadan Ayrildi: " + ms.name);
        io.emit('resetList');
        users.forEach(element => {
            io.emit('userList', define_User_Name_Class = {  
                name: element.name,
                imageName: element.imageName,
                socketId: element.socketId,
            });
        });


    });

    socket.on('BeklemeOdasi_Mesaj', (ms) => {
        console.log("Mesaj " + ms.GonderenIsim + "=>" + ms.MesajIcerik + "  Foto Adi=>" + ms.FotoAdi);
        
        io.emit("BeklemeOdasi_Mesaj", ms);

        
            
    });

    socket.on('SoruCevaplama', (ms) => {
        console.log("Birisi Soru Cevapladi. Soru No: " + ms.SoruIndex + "=>" + ms.DogruCevapladi);
        
        io.emit("SoruCevaplama", ms);

        
            
    });


    socket.on('BeklemeOdasi_HazirOl', (ms) => {
        hazir_user_count = hazir_user_count + 1;
        console.log("Biri Hazir Oldu:" + ms.GonderenIsima);
        io.emit("BeklemeOdasi_Mesaj", {GonderenIsim: "Sunucu", MesajIcerik:ms.MesajIcerik, Admin:false, FotoAdi:ms.FotoAdi});
        
        //UNUTMA BURA
        //if(hazir_user_count == users.length && users.length > 1)    
            selectRandomLines(filePath, numLinesToSelect)
        .then((selectedLines) => {
            console.log('Selected random lines:');
            selectedLines.forEach((line) => console.log(line));
            io.emit("Bekleme_Odasi_OyunBaslama", JSON.stringify(selectedLines));

            })
          .catch((err) => {
          console.error('Error:', err);
          });
          console.log("Oyun BASLADI!");
    });

    socket.on('BeklemeOdasi_HazirOlma', (ms) => {
        console.log("Biri Hazir OLMADI:" + ms.GonderenIsima);
        hazir_user_count = hazir_user_count - 1;
        io.emit("BeklemeOdasi_Mesaj", {GonderenIsim: "Sunucu", MesajIcerik:ms.MesajIcerik, Admin:false, FotoAdi:ms.FotoAdi});
    });




    //asama1 sonuclari gonder

});

let TurNo = 0;
let SarkiNo = 0;
let HazirOlmaSayi = 0;

app.get('/', (req, res) => {
    res.json(users);
  });


  // Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Function to select random lines from a file
  function selectRandomLines(filePath, numLines) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
  
        // Split the contents of the file into an array of lines
        const lines = data.trim().split('\n');
  
        if (lines.length <= numLines) {
          return resolve(lines);
        }
  
        // Shuffle the array to randomize the order of lines
        shuffleArray(lines);
  
        // Select the first 'numLines' lines from the shuffled array
        const selectedLines = lines.slice(0, numLines);
  
        resolve(selectedLines);
      });
    });
  }
  
  // Get the current directory path
  const currentDirectory = __dirname;
  
  // Construct the file path
  const filePath = path.join(currentDirectory, 'filenames_without_extension.txt');
  
  // Number of lines to select
  const numLinesToSelect = 7;
