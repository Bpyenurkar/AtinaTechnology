// const mysql = require('mysql');

// const config = {
//     user: 'root',
//     password: '',
//     database: 'user',
//     host: 'localhost',
//     port: 3306,
//     multipleStatements: true,
// };

// const createConnection = () => {
//     const connection = mysql.createConnection(config); // replace it with connection pool for better performance

//     const query = sql => {
//         return new Promise((resolve, reject) => {
//             connection.query(sql, (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });
//     };

//     const end = () => {
//         return new Promise((resolve, reject) => {
//             connection.end(error => {
//                 if (error) {
//                     reject();
//                 } else {
//                     resolve();
//                 }
//             })
//         });
//     };

//     return new Promise((resolve, reject) => {
//         connection.connect(error => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve({query, end});
//             }
//         });
//     })
// };

// module.exports = {
//     createConnection
// };

const mysql = require('mysql');

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
                    db          `);
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