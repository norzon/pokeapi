/*
---------- Basic setup ---------- 
*/
// Load express
const express = require('express');
// Initialize express app
const app = express();

// Load server settings and package file
const settings = require('../settings');
const package = require('../package.json');

// Load db wrapper
const DB = require('./db');
const db = new DB(Object.assign(settings.mysql, { debug: settings.mode === "development" }));


/*
---------- Middlewares ----------
*/


/*
---------- Routes ----------
*/
// Get the API status, version etc.
app.get('/', (req, res) => {
    db.query('SELECT CURRENT_TIMESTAMP(3) AS date')
    .then(results => {
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
    })
    .catch(error => {
        res.status(500).json({
            success: false,
            description: error
        });
    })
});

// Pokemon routes
app.get('/pokemon', require('./routes/pokemon/get.all')(db));


/*
---------- Checks ----------
*/
try {
    // Test database
    db.test();

    // Run server on port
    app.listen(8080, () => console.log('App running on 8080'));
} catch (e) {
    // Error occured, log to console
    console.error(e);
}
