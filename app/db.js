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

    /**
     * Creates a new DB class
     * @param {*} settings The settings to pass to the constructor
     */
    static initiate (settings) {
        return new this(settings);
    }

    /**
     * Checks the database connection by executing a generic query
     */
    test () {
        return this.query('SELECT CURRENT_DATE AS `date`');
    }

    /**
     * Wrapper for running a query to the database using a JS Promise
     * @param {string} str The query string to execute
     * @param {Array} params The parameters to bind to the query
     * 
     * @returns {Promise<>}
     */
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

    /**
     * Creates a new prepared statement with a given query string
     * @param {string} str The query string to prepare
     * 
     * @returns {STATEMENT} Object Returns a prepared statement
     */
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

    /**
     * Executes the prepared query with the given inputs
     * @param {Object | Array} input The parameters to bind to the query
     */
    execute (input) {
        let query = this._str;
        let params = [];

        if (input instanceof Array) {
            params = input;
        } else if (typeof input === "object") {
            Object.keys(input).forEach(key => {
                params[query.indexOf(key)] = input[key];
            });
            Object.keys(input).forEach(key => {
                query = query.replace(key, '?')
            });
            params = params.filter(v => v);
        }
        return this.db.query(query, params);
    }
}

module.exports = DB;