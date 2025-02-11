const express = require("express");
const sql = require("mysql")
const bodyParser = require('body-parser')
const app = express();
const port = 3030;
var data;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task'
});
if (connection) {
    console.log("succeed")
}
app.get("/", (req, res) => {
    res.render('home')
})
app.post("/login", (req, res) => {
    let { email, password } = req.body;
    let query = "select * from details where email = ?"
    connection.query(query, [email], (err, result) => {
        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            data = result[0];
            console.log(data)
            console.log(password)
            if (result[0].password == password) {
                res.render('change')
            } else {
                res.redirect('/')
            }
        }
    })
})

app.get("/sign-up", (req, res) => {

    res.render('signup')
})
app.post('/success', (req, res) => {
    let database = req.body;
    let query = "insert into details (Name, Email, password, Number) values(?,?,?,?)";
    connection.query(query, [database.name, database.email, database.pass1, database.phn], (err, result) => {
        if (err) {
            throw err
        } else {
            console.log("DB Inserted")
        }
    })
    console.log(data);
    res.redirect('/')
})

app.get('/password', (req, res) => res.render("password"));

app.post("/update", (req, res) => {
    let { email, oldpass, newpass } = req.body;
    let q = "select password from details where email = ?";
    let updq = "update details set password = ? where email = ?";
    let gpass = "select password from password_history where email = ? limit 6";
    let inspq = "insert into password_history (email, password) values (?, ?)";
    let dltold = "delete from password_history where email = ? ORDER BY id ASC limit 1";

    connection.query(q, [email], (error, results) => {
        if (error || results.length === 0 || results[0].password !== oldpass) 
            return;
        connection.query(gpass, [email], (error, hist) => {
            if (error) 
                return;
            if (hist.some(row => row.password === newpass)) 
                return res.status(400).send("New password should not be the last six password.");         
            connection.query(updq, [newpass, email], (error) => {
                if (error) 
                    return;          
                connection.query(inspq, [email, newpass], (error) => {
                    if (error) 
                        return;       
                    if (hist.length >= 6) 
                        connection.query(dltold, [email]);        
                    res.send("Password changed successfully!");
                });
            });
        });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
