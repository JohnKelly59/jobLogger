const appData= require("C:/Users/First/Desktop/Web Development/joblog/app.js")

//creates active table
const sqlite3 = require('sqlite3').verbose();
let data = []
let archives = []
const sqe = []
let users = []
let db = new sqlite3.Database('./log.db');

//creates tables
function tableCreation(){
db.run("CREATE TABLE IF NOT EXISTS active(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, company TEXT, title TEXT, interest NUMBER,salary MONEY, comments TEXT, archive INTEGER, time TEXT)",function(err){
  if (err){
    return console.log(err.message)
  }else{
    //console.log("Table 1 Created")
    //console.log(users)
  }
})

db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, passwordHash TEXT)",function(err){
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
 db.all(date,[],(err,rows)=>{
            if(err){
               return console.error(err.message);
            }
           rows.forEach((row)=>{
               data.push(row);
           });

  });
}

//adds data to archive array
function addToArchive(){
  let date2 = 'SELECT * FROM active WHERE archive = 1 AND user_id= "'+appData.userB+'" ORDER BY id' ;
   db.all(date2,[],(err,rows)=>{
             if(err){
                 return console.error(err.message);
             }
             rows.forEach((row)=>{
                 archives.push(row);
             });
     //console.log(archives)

   });
}

// resets db autoincrement number
function resetSQE(){
db.run('UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE  NAME= "active" ',(err,rows)=>{
  if (err){
    return console.log(err.message)
  }

    //console.log("SQE updated");

})
}

// adds new user to user list
function addToUserList(){
  let ad = 'SELECT * FROM users ORDER BY id' ;
   db.all(ad,[],(err,rows)=>{
             if(err){
                 return console.error(err.message);
             }
             rows.forEach((row)=>{
                 users.push(row);
             });
     console.log("didit2");
     //console.log(users)
})
}

function pressedArchive(){
let button = appData.archiveB;
//console.log(appData.userB)
  db.run("UPDATE active SET archive = 1 WHERE id = '"+button+"' AND user_id = '"+appData.userB+"'"  , function(err){
  if (err){
    return console.log(err.message)
  }else{
    archives = []
    addToArchive()
  }
})
}

//Puts new log nito homepage
function newLog(){
  console.log(appData.userB)
db.run("INSERT INTO active(user_id, company, title, interest, salary, comments, archive, time) VALUES ('"+appData.userB+"','"+appData.company+"', '"+appData.title+"', '"+appData.interest+"', '"+appData.salary+"', '"+appData.comments+"', '0', '"+appData.day+"')", function(err){
if (err){
  return console.log(err.message)
}else{
console.log(appData.userB)
let newEntry = ("SELECT * FROM active WHERE user_id = '"+appData.userB+"' ORDER BY id DESC LIMIT 1");
  db.all(newEntry,[],(err,rows)=>{
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

function deleteFromActive(){
    db.run("DELETE FROM active Where id = '"+appData.delete+"' AND user_id= '"+appData.user+"'", function(err){
    if (err){
      return console.log(err.message)
    }})};






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

// function all() {
//   console.log(appData.userB + "hereye")
// let date = 'SELECT * FROM active WHERE archive = 1 AND user_id = "'+appData.userB+'" ORDER BY id' ;
//  db.all(date,[],(err,rows)=>{
//             if(err){
//                return console.error(err.message);
//             }
//            rows.forEach((row)=>{
//                data.push(row);
//            });
//               console.log(data + "here")
//   });
// }

module.exports = {tableCreation, addToData, addToArchive, resetSQE, addToUserList, users, data, archives, sqe, pressedArchive, newLog, deleteFromActive};
