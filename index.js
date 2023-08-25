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

print("YENI VERSIYON");

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json(connectedUsers);
});


const connectedUsers = [];
let InGame;

class User {
  constructor(userName, imageName, socketId, isReady) {
    this.userName = userName;
    this.imageName = imageName;
    this.socketId = socketId;
    this.isReady = isReady;
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('User Connected With Id==>' + socket.id);

  socket.on('Ilk_Baglanma', (userData) => {

    if(InGame){
      if(connectedUsers.length > 0) return;
      else InGame = false;
    }

    const newUser = new User(userData.userName, userData.imageName, socket.id, userData.isReady);
    connectedUsers.push(newUser);
    console.log("Baglanan Kullanici Adi:" + userData.userName + " Foto Adi:" + userData.imageName);

    io.emit('userList', (connectedUsers));

    const countReadyUsers = connectedUsers.reduce((count, user) => {
      if (user.isReady) {
        return count + 1;
      }
      return count;
    }, 0);
    io.emit('HazirOlmaSayisi', countReadyUsers);
  });

  socket.on('ODADAN_Ayrilma', (userData) => {
    console.log("Birisi Odadan Ayrildi:" + userData.userName);

    const indexToRemove = connectedUsers.findIndex(user => user.socketId === userData.socketId);

    if (indexToRemove !== -1) {
      connectedUsers.splice(indexToRemove, 1);
    }
    io.emit('userList', (connectedUsers));



    const countReadyUsers = connectedUsers.reduce((count, user) => {
      if (user.isReady) {
        return count + 1;
      }
      return count;
    }, 0);
    io.emit('HazirOlmaSayisi', countReadyUsers);
  });

  socket.on('Hazir_Olma', (userData) => {
    console.log("Birisi Durumu Degisti:" + userData.userName + "=>" + userData.isReady);

    connectedUsers.forEach(user => {
      if (user.socketId === userData.socketId) {
        user.isReady = userData.isReady;
      }
    });

    const countReadyUsers = connectedUsers.reduce((count, user) => {
      if (user.isReady) {
        return count + 1;
      }
      return count;
    }, 0);
    console.log("Hazir Olma Sayisi:" + countReadyUsers);

    if(countReadyUsers === connectedUsers.length){
        //Oyunu baslat
        if(!InGame){
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
      }else{
        io.emit('HazirOlmaSayisi', countReadyUsers);
      }
      InGame = true;
    }
  });



  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from the array on disconnect
    const disconnectedUser = connectedUsers.find(user => user.socketId === socket.id);
    if (disconnectedUser) {
      connectedUsers.splice(connectedUsers.indexOf(disconnectedUser), 1);
    }

    console.log(`CurrentUserCount:` + connectedUsers.count);

    const countReadyUsers = connectedUsers.reduce((count, user) => {
      if (user.isReady) {
        return count + 1;
      }
      return count;
    }, 0);
    io.emit('HazirOlmaSayisi', countReadyUsers);
  });


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server dinliyo on port ${PORT}`);
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
  const numLinesToSelect = 10;