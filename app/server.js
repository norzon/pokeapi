/*
---------- Basic setup ---------- 
*/
// Load express
const express = require('express');
// Initialize express app
const app = express();
// Load mysql
const mysql = require('mysql');

// Load server settings and package file
const settings = require('../settings');
const package = require('../package.json');

// Create database pool
const pool = mysql.createPool({
    connectionLimit: settings.mysql.conn,
    host: settings.mysql.host,
    user: settings.mysql.user,
    password: settings.mysql.pswd,
    database: settings.mysql.dtbs,
    port: settings.mysql.port
});

/*
---------- Middlewares ----------
*/


/*
---------- Routes ----------
*/
// Get the API status, version etc.
app.get('/', (req, res) => {
    pool.query('SELECT CURRENT_TIMESTAMP(3) AS date', function (error, results, fields) {
        if (error) {
            res.status(500).json({
                success: false,
                description: error
            });
        }
        res.json({
            success: true,
            description: 'Fetched the server status successfully',
            results: {
                db: {
                    time: results[0].date
                },
                server: {
                    time: new Date().toISOString(),
                    version: package.version,
                    version_full: (function(){
                        let v = package.version.split('.');
                        return {
                            major: v[0],
                            minor: v[1],
                            patch: v[2]
                        };
                    })()
                }
            }
        });
    });
});


/*
---------- Checks ----------
*/
try {
    // Check db connection
    pool.query('SELECT CURRENT_DATE AS `date`', function (error, results, fields) {
        if (error) {
            throw error;
        }
    });
    // Run server on port
    app.listen(8080, () => console.log('App running on 8080'));
} catch (e) {
    // Error occured, log to console
    console.error(e);
}
