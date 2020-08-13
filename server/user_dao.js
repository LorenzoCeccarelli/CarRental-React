'use strict';

const User = require('./user');
const db = require('./db');
const bcrypt = require('bcrypt');

/**
 * Function to create a User object from a row of the users table
 * @param {*} row a row of the users table
 */
const createUser = function (row) {
    const name = row.Nome;
    const surname =row.Cognome;
    const email = row.Email;
    const hash = row.Hash;
    const numNoleggi = row.NumeroNoleggi;
    return new User(name,surname, email, hash,numNoleggi);
}

// getUser ritorna l'utente corrispondente alla mail passata come parametro
exports.getUser = function (email) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE email = ?"
        db.all(sql, [email], (err, rows) => {
            if (err) 
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else{
                
                const user = createUser(rows[0]);
                resolve(user);
            }
        });
    });
  };

//checkPassword calcola l'hash sulla password passata come parametro e la confronta con l'hash dell'utente (Verifica se la password è corretta oppure no)
exports.checkPassword = function(user, password){
    let hash = bcrypt.hashSync(password, 10);
    return bcrypt.compareSync(password, user.hash);
}