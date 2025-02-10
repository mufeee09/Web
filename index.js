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

app.get('/password', (req, res) => {
    res.render("password");
});

app.post("/update", (req, res) => {
    let { email, oldpass, newpass } = req.body;
    let q = "select password from details where email = ?"
    let query = "update details set password = ? where email = ?"
    let getpass = "select password from password_history where email = ? limit 3"
    let ipass = "insert into password_history (email, password) values (?, ?)"

    connection.query(q, [email], (error, results) => {
        if (error) throw error;
        if (results.length > 0 && results[0].password === oldpass) {
            connection.query(getpass, [email], (error, hist) => {
                if (error)
                    throw error;
                let usdpass = hist.map(row => row.password);
                if (usdpass.includes(newpass)) {
                    res.send("New password should not be the last three password.");
                } else {
                    connection.query(query, [newpass, email], (error) => {
                        if (error) 
                            throw error;
                        connection.query(ipass, [email, newpass], (error) => {
                            if (error) 
                                throw error;
                            res.redirect("/");
                            console.log("Password changed")
                        });
                    });
                }
            });
        } else {
            res.redirect("/update");
            console.log("Old password does not match.");
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
