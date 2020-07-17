var sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            _to INTEGER,
            _from INTEGER,
            identifier text,
            message text,
            type text,
            attachment text,
            is_deleted INTEGER DEFAULT 0
        )`,
        (err) => {
            if (err) {
                // Table already created
                console.log("message table already created");
            }else{
                console.log("message table created");
            }
        }); 
    }
});

module.exports = db;