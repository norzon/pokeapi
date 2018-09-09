// Load mysql
const mysql = require('mysql');

class DB {

    constructor (settings) {
        // Create pool
        this.pool = mysql.createPool({
            connectionLimit: settings.conn,
            host: settings.host,
            user: settings.user,
            password: settings.pswd,
            database: settings.dtbs,
            port: settings.port
        });
    }

    // Check db connection
    test () {
        const self = this;
        return new Promise(function(res, rej){
            self.pool.query('SELECT CURRENT_DATE AS `date`', function (error, results, fields) {
                if (error) {
                    rej(error);
                } else {
                    res(results);
                }
            });
        });
    }

    // Generic query wrapper
    query (str) {
        const self = this;
        return new Promise(function(res, rej){
            self.pool.query(str, function(error, results, fields){
                if (error) {
                    rej(error);
                } else {
                    res(results, fields);
                }
            });
        });
    }
}

module.exports = DB;