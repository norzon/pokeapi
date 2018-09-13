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

        // Save debug settings
        this.isDebug = settings.debug || false;

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
            // If not debug, remove unneccessary whitespaces
            if (!self.isDebug) {
                // Replace all white spaces with a single white space
                // Caution, this may break the desired query if more than one white spaces are inside a mysql string
                str = str.replace(/\s+/g, ' ');

                // The symbols that do not need white spaces before or after
                let symbols = '(\\=|\\<|\\>|\\,|\\-|\\!|\\+|\\(|\\)|\\*|\\/|\\`)';

                // Search for symbols that have white space before
                str = str.replace(new RegExp(`([^\\s\\"'])\\s${symbols}`, 'g'), '$1$2');
                // Search for symbols that have white space after
                str = str.replace(new RegExp(`${symbols}\\s([^\\s\\"'])`, 'g'), '$1$2');
            }
            console.log(str);
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