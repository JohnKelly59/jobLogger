const appData= require(__dirname + "/server.js")
const mysql = require('mysql2')

const db = mysql.createConnection
({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
database: 'jobLog'
});


db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  let sql = "CREATE DATABASE IF NOT EXISTS jobLog "
  db.query(sql, (err) =>{
    if(err){
      throw err
    }
    console.log("Database Created")
  })
  
});



var data = []
var archives = []
const sqe = []
var users = []


//creates tables
function tableCreation(){
db.query("CREATE TABLE IF NOT EXISTS active(id INT PRIMARY KEY AUTO_INCREMENT, user_id INTEGER, company TEXT, title TEXT, interest INT ,salary INT, comments TEXT, archive INT, time TEXT)",function(err){
  if (err){
    return console.log(err.message)
  }else{
    //console.log("Table 1 Created")
    //console.log(users)
  }
})

db.query("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTO_INCREMENT, name TEXT, email TEXT, passwordHash TEXT)",function(err){
  if (err){
    return console.log(err.message)
  }else{
    //console.log("Table 2 Created")
  }
})
}

//adds data to data array
function addToData() {

let date = 'SELECT * FROM active WHERE archive=0 AND user_id= "'+appData.userB+'" ORDER BY id' ;
 db.query(date,[],(err,rows)=>{
            if(err){
               return console.error(err.message);
            }
           rows.forEach((row)=>{
               data.push(row);
               //console.log(row)
           });
console.log(data)
  });
}

//adds data to archive array
function addToArchive(){
  
  let date2 = 'SELECT * FROM active WHERE archive = 1 AND user_id= "'+appData.userB+'" ORDER BY id' ;
   db.query(date2,[],(err,rows)=>{
             if(err){
                 return console.error(err.message);
             }
            
             rows.forEach((row)=>{
                 archives.push(row);
             });
     console.log(archives + "addtoarch")

   });
}

// resets db autoincrement number
function resetSQE(){
db.query('ALTER TABLE active AUTO_INCREMENT = 1',(err,rows)=>{
  if (err){
    return console.log(err.message)
  }

    //console.log("SQE updated");

})
}

function newUser(){
    db.query("INSERT INTO users(name, email, passwordHash) VALUES ('" + appData.name + "', '" + appData.email + "', '"+ appData.hashPassword + "')", function(err) {
      if(err){
          return console.error(err.message);
      }
})
}

// adds new user to user list
function addToUserList(){
  let ad = 'SELECT * FROM users ORDER BY id' ;
   db.query(ad,[],(err,rows)=>{
             if(err){
                 return console.error(err.message);
             }
             console.log(rows)
             rows.forEach((row)=>{
                 users.push(row);
             });
     console.log("didit2");
     console.log(users)
})
}
//puts data into archive arrays
function pressedArchive(){
let button = appData.archiveB;
//console.log(appData.userB)
  db.query("UPDATE active SET archive = 1 WHERE id = '"+button+"' AND user_id = '"+appData.userB+"'"  , function(err){
  if (err){
    return console.log(err.message)
  }else{
    archives.length = 0
    console.log(archives +"pressed")
    addToArchive()
  }
})
}

//Puts new log into db
function newLog(){
  console.log(appData.userB)
db.query("INSERT INTO active(user_id, company, title, interest, salary, comments, archive, time) VALUES ('"+appData.userB+"','"+appData.company+"', '"+appData.title+"', '"+appData.interest+"', '"+appData.salary+"', '"+appData.comments+"', '0', '"+appData.day+"')", function(err){
if (err){
  return console.log(err.message)
}else{
console.log(appData.userB)
let newEntry = ("SELECT * FROM active WHERE user_id = '"+appData.userB+"' ORDER BY id DESC LIMIT 1");
  db.query(newEntry,[],(err,rows)=>{
             if(err){
                return console.error(err.message);
             }
            rows.forEach((row)=>{
                data.push(row);
            });
               console.log(data)
   });
}
})
}

//deletes data from database
function deleteFromActive(){
    db.query("DELETE FROM active Where id = '"+appData.delete+"' AND user_id= '"+appData.userB+"'", function(err){
    if (err){
      return console.log(err.message)
    }})};

//moves data from arhive array to data array
    function restoreFromArchive(){
      let restore = appData.restore;
      //console.log(appData.userB)
        db.query("UPDATE active SET archive = 0 WHERE id = '"+restore+"' AND user_id = '"+appData.userB+"'"  , function(err){
        if (err){
          return console.log(err.message)
        }else{
          archives.length = 0
          console.log(archives +"pressed")
          addToArchive()
          data.length = 0
          addToData()
        }
      })
      }



function eraseArray(){
  data.length = 0
  archives.length = 0
  console.log(data)
}





// db.run("DROP TABLE active"
// ,(err,rows)=>{
//   if (err){
//     return console.log(err.message)
//   }
//
//     console.log("job Done");
// })
// function deleteTable(){
// db.run("Delete from active where id >= 1",function(err){
//   if (err){
//     return console.log(err.message)
//   }else{
//     console.log("DELETED")
//   }
// })
// }

//


getDate = function(){
  var today  = new Date();
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  return today.toLocaleDateString("en-US", options);
  
  };

module.exports = {tableCreation, addToData, addToArchive, resetSQE,
  addToUserList, users, data, archives, sqe, pressedArchive,
  newLog, deleteFromActive, eraseArray, newUser, restoreFromArchive, getDate};
