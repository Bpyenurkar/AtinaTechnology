const express = require('express');
const mysql = require('mysql');
const app = express();


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "user"
});
db.connect((err) => {
    if (!err) return console.log("connected to mysql db");
    return console.log(err);

});

//to send the json data we have to use express middleware
app.use(express.json());
app.get('/', (req, res) => {
    res.send("i am from backend");
})


//1. register new user
app.post("/registration", (req, res) => {
    const q = "INSERT INTO user.user(`id`,`firstname`,`lastname`,`username`,`password`,`email`,`phone`) VALUES (?)"
    const values = [
        req.body.id,
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.phone,
        // req.body.created
        // req.body.updated

    ]
    // connect query (data,values,fields)
    db.query(q, [values], (err, data) => {
        if (err) return res.status(400).json("something is wrong" + err);
        return res.status(200).json("book data inserted into the table");
    })

});
//2.  API to get all users from uses table
app.get("/getallusers", (req, resp) => {

    // resp.send("route done");
    db.query("SELECT * FROM user.user;", (err, result) => {
        if (err) {
            resp.send("error");
        }
        else {
            resp.send(result);
        }
    })
});

// //3.  login API and logout api



const database = require('./database.js');

const createRestApi = app => {
    app.post('/user/login', async (request, response) => {
        if (request.session.userId) {
            response.json({result: 'ERROR', message: 'User already logged in.'});
        } else {
            const user = {
                username: request.body.username,
                password: request.body.password
            };
            const db = await database.createConnection();
            try {
                const result = await db.query(`
                    SELECT id 
                    FROM user.user 
                    WHERE 
                            username=${mysql.escape(user.username)}
                        AND password=${mysql.escape(user.password)}
                    LIMIT 1
                `);
                if (result.length > 0) {
                    const user = result[0];
                    request.session.userId = user.id;
                    response.json({result: 'SUCCESS', userId: user.id});
                } else {
                    response.json({result: 'ERROR', message: 'Indicated username or/and password are not correct.'});
                }
            } catch(e) {
                console.error(e);
                response.json({result: 'ERROR', message: 'Request operation error.'});
            } finally {
                await db.end();
            }
        }
    });
      
    app.get('/user/logout', async (request, response) => {
        if (request.session.userId) {
            delete request.session.userId;
            response.json({result: 'SUCCESS'});
        } else {
            response.json({result: 'ERROR', message: 'User is not logged in.'});
        }
    });
};

module.exports = {
    createRestApi
};

// const session = require('express-session');

// const {createRestApi} = require('./backend/api.js');


// const port = 8000;           // port used to run server


// app.use(express.json());

// app.use(
//     express.urlencoded({
//         extended: true,
//     })
// );

// app.use(
//     session({
//         name: 'SESSION_ID',      // cookie name stored in the web browser
//         secret: 'my_secret',     // helps to protect session
//         cookie: {
//             maxAge: 30 * 86400000, // 30 * (24 * 60 * 60 * 1000) = 30 * 86400000 => session is stored 30 days
//         }
//     })
// );

// createRestApi(app);




// // 5. create forget password

// //send email
// function sendEmail(email, token) {
 
//     var email = email;
//     var token = token;
 
//     var mail = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: '', // Your email id
//             pass: '' // Your password
//         }
//     });
 
//     var mailOptions = {
//         from: 'tutsmake@gmail.com',
//         to: email,
//         subject: 'Reset Password Link - Tutsmake.com',
//         html: '<p>You requested for reset password, kindly use this <a href="http://localhost:8000/reset-password?token=' + token + '">link</a> to reset your password</p>'
 
//     };
 
//     mail.sendMail(mailOptions, function(error, info) {
//         if (error) {
//             console.log(1)
//         } else {
//             console.log(0)
//         }
//     });
// }
// //Now open the link https://myaccount.google.com/lesssecureapps to Allow less secure apps: ON. 
// //It will send the email using Gmail account.



// /* send reset password link in email */
// router.post('/reset-password-email', function(req, res, next) {
 
//     var email = req.body.email;
 
//     //console.log(sendEmail(email, fullUrl));
 
//     connection.query('SELECT * FROM users WHERE email ="' + email + '"', function(err, result) {
//         if (err) throw err;
         
//         var type = ''
//         var msg = ''
   
//         console.log(result[0]);
     
//         if (result[0].email.length > 0) {
 
//            var token = randtoken.generate(20);
 
//            var sent = sendEmail(email, token);
 
//              if (sent != '0') {
 
//                 var data = {
//                     token: token
//                 }
 
//                 connection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function(err, result) {
//                     if(err) throw err
         
//                 })
 
//                 type = 'success';
//                 msg = 'The reset password link has been sent to your email address';
 
//             } else {
//                 type = 'error';
//                 msg = 'Something goes to wrong. Please try again';
//             }
 
//         } else {
//             console.log('2');
//             type = 'error';
//             msg = 'The Email is not registered with us';
 
//         }
    
//         req.flash(type, msg);
//         res.redirect('/');
//     });
// })
// // 6.& 7. Reset and change password api
// /* update password to database */
// router.post('/update-password', function(req, res, next) {
 
//     var token = req.body.token;
//     var password = req.body.password;
 
//    connection.query('SELECT * FROM users WHERE token ="' + token + '"', function(err, result) {
//         if (err) throw err;
 
//         var type
//         var msg
 
//         if (result.length > 0) {
                
//               var saltRounds = 10;
 
//              // var hash = bcrypt.hash(password, saltRounds);
 
//             bcrypt.genSalt(saltRounds, function(err, salt) {
//                   bcrypt.hash(password, salt, function(err, hash) {
 
//                    var data = {
//                         password: hash
//                     }
 
//                     connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
//                         if(err) throw err
                   
//                     });
 
//                   });
//               });
 
//             type = 'success';
//             msg = 'Your password has been updated successfully';
              
//         } else {
 
//             console.log('2');
//             type = 'success';
//             msg = 'Invalid link; please try again';
 
//             }
 
//         req.flash(type, msg);
//         res.redirect('/');
//     });
// })
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server listening on PORT http://localhost:${PORT}/`);
});

//     // CREATE TABLE`user`.`user`(
//     //     `id` INT NOT NULL AUTO_INCREMENT,
//     //     `firstname` VARCHAR(45) NULL,
//     //     `lastname` VARCHAR(45) NULL,
//     //     `username` VARCHAR(45) NULL,
//     //     `password` VARCHAR(45) NULL,
//     //     `email` VARCHAR(45) NULL,
//     //     `phone` VARCHAR(45) NULL,
//     //     `created` VARCHAR(45) NULL,
//     //     `updated` VARCHAR(45) NULL,
//     //     PRIMARY KEY(`id`),
//     //     UNIQUE INDEX`username_UNIQUE`(`username` ASC) VISIBLE,
//     //     UNIQUE INDEX`email_UNIQUE`(`email` ASC) VISIBLE,
//     //     UNIQUE INDEX`phone_UNIQUE`(`phone` ASC) VISIBLE);