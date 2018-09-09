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

        // Save settings
        this.settings = settings;
    }

    static initiate (settings) {
        return new this(settings);
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
    query (str, params = []) {
        const self = this;
        return new Promise(function(res, rej){
            if (params) {
                self.pool.query(str, params, function(error, results, fields){
                    if (error) {
                        rej(error);
                    } else {
                        res(results, fields);
                    }
                });
            } else {
                self.pool.query(str, function(error, results, fields){
                    if (error) {
                        rej(error);
                    } else {
                        res(results, fields);
                    }
                });
            }
        });
    }

    prepare (str) {
        return new STATEMENT(str, this);
    }
}

class STATEMENT {

    constructor (str, db) {
        // Check input
        if (typeof str !== "string")
            throw new TypeError('Query should be type: string')
        
        // Save the query string 
        this._str = str;

        // Save the database reference
        this.db = db;
    }

    execute (input) {
        let query = this._str;
        const params = [];

        if (input instanceof Array) {
            params = input;
        } else if (typeof input === "object") {
            Object.keys(input).forEach(key => {
                // query = query.replace(key, mysql.escape(input[key]));
                query = query.replace(key, '?')
                params.push(input[key])
            });
        }
        return this.db.query(query, params);
    }
}

module.exports = DB;