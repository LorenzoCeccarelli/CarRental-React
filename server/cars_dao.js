'use strict';

const Car = require('./car');
const db = require('./db');
const moment = require('moment');
const TabellaPrezzi = {
    "A" : 80,
    "B" : 70,
    "C" : 60,
    "D" : 50,
    "E" : 40,
    "Meno di 50"   : -5/100,
    "Meno di 150"  :0,
    "Illimitati" : 5/100,
    "Inferiore a 25 anni"  : 5/100,
    "Superiore a 65 anni": 10/100,
    "Compreso tra 25 e 65 anni": 0,
    "guidatoriAddizionali" : 15/100,
    "assicurazioneExtra" : 20/100
}
const createCar = function (row) {
    return new Car(row.CId,row.Categoria,row.Marca,row.Modello);
}

/**
 * getAllCars ritorna tutte le auto presenti nel database
 */
exports.getAllCars = function() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT CId,Categoria,Marca,Modello FROM CARS ";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let cars = rows.map((row) => createCar(row));
                resolve(cars);
            }
        });
    });
}

/**
 * getCars ritorna il numero di auto che soddisfano i requisiti, il CId dell'auto e il prezzo
 */
function getCars(filters,email){
    return new Promise((resolve,reject) =>{
        const dataInizio = filters.dataInizio;
        const dataFine = filters.dataFine;
        const categoria = filters.categoria
        const sql = `SELECT COUNT(*) AS numDisponibili,CId 
                    FROM CARS AS C
                    WHERE Categoria = ? AND C.CId NOT IN ( SELECT CId 
                                                            FROM NOLEGGI 
                                                            WHERE ("${dataInizio}"<=GiornoInizio AND "${dataFine}">=GiornoInizio) OR ("${dataInizio}"<=GiornoFine AND "${dataFine}">=GiornoFine) OR ("${dataInizio}"<=GiornoInizio AND GiornoFine<="${dataFine}")
                                                            OR (GiornoInizio<="${dataInizio}" AND "${dataFine}"<=GiornoFine))`;
        db.all(sql, [categoria],(err, rows)=>{
            if (err){
                reject(err);
            }
            else
                //ritorna il numero di auto che soddisfano i requisiti,il primo CId disponibile e il prezzo
                calcolaPrezzo(filters,email,rows[0].numDisponibili).then(prezzo=>{resolve({numDisponibili: rows[0].numDisponibili, Prezzo : prezzo,CId :rows[0].CId})});
                
        })
    })
}
    
exports.getCars = getCars;
/**
 * calcolaPrezzo è una funzione che calcola il prezzo della configurazione consultando la mappa TabellaPrezzi
 */
async function calcolaPrezzo(filters,email,numDisponibili){
    let prezzoBase = TabellaPrezzi[filters.categoria];
    let numeroGiorni = moment(filters.dataFine).diff(moment(filters.dataInizio),"days") + 1;
    prezzoBase = prezzoBase * numeroGiorni;
    let prezzoFinale = prezzoBase;
    prezzoFinale+=prezzoBase*TabellaPrezzi[filters.KmStimati];
    prezzoFinale+=prezzoBase*TabellaPrezzi[filters.EtaGuidatore];
    if(filters.guidatoriAddizionali ==="1")
        prezzoFinale+=prezzoBase*TabellaPrezzi["guidatoriAddizionali"];
    if(filters.assicurazioneExtra ==="1")
        prezzoFinale+=prezzoBase*TabellaPrezzi["assicurazioneExtra"];
    return new Promise((resolve,reject)=>{
    
    getNumNoleggi(email).then((numNoleggi)=>{
        if (numNoleggi>=3)
            prezzoFinale+=prezzoBase*(-10/100);
        getNumAutoPerCategoria(filters.categoria)
            .then((tot)=>{
                if(numDisponibili/tot<1/10)
                    prezzoFinale+=prezzoBase*(1/10);
                resolve(prezzoFinale);
            })
            .catch((err)=>reject(err))
    })
    .catch((err)=>reject(err));
    
    });
}
/**
 * getNumAutoPerCategoria ritorna il numero totale di auto per la categoria passata come parametro
 */
function getNumAutoPerCategoria(categoria){
    return new Promise((resolve,reject)=>{
        const sql = "SELECT COUNT(*) AS NumAuto FROM CARS WHERE Categoria= ?";
        db.all(sql, [categoria],(err,rows)=>{
            if(err){
                reject(err);
            }
            else {
                resolve(rows[0].NumAuto);
            }
        });
    });
    }

/**
 * getNumNoleggi ritorna il numero di noleggi di un client la cui email è passata come parametro
 */
async function getNumNoleggi(email){
    return new Promise((resolve,reject)=>{
        const sql = "SELECT COUNT(*) AS NumNoleggi FROM NOLEGGI WHERE Email = ? AND GiornoFine<?";
        db.all(sql, [email,moment().format("YYYY-MM-DD")],(err,rows)=>{
            if(err){
                reject(err);
            }
            else {
                resolve(rows[0].NumNoleggi);
            }
        });
    });
}

/**
 * getFutureRental ritorna i noleggi futuri dell'utente identificato dall'email
 */
exports.getFutureRental = function (email){
    return new Promise((resolve, reject) => {
        const sql = "SELECT RId,Marca,Modello,Categoria,GiornoInizio,GiornoFine,EtaGuidatore,GuidatoriAddizionali,KmStimati,AssicurazioneExtra,Prezzo FROM NOLEGGI AS N,CARS AS C WHERE Email=? AND N.CId=C.CId AND GiornoFine>=?";
        db.all(sql, [email, moment().format("YYYY-MM-DD")], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let noleggi = rows.map((noleggio) => ({
                    "RId" : noleggio.RId,
                    "Marca" : noleggio.Marca,
                    "Modello" : noleggio.Modello,
                    "Categoria" : noleggio.Categoria,
                    "GiornoInizio" : noleggio.GiornoInizio,
                    "GiornoFine" : noleggio.GiornoFine,
                    "EtaGuidatore" : noleggio.EtaGuidatore,
                    "GuidatoriAddizionali" : noleggio.GuidatoriAddizionali,
                    "KmStimati" : noleggio.KmStimati,
                    "AssicurazioneExtra" : noleggio.AssicurazioneExtra,
                    "Prezzo" : noleggio.Prezzo
                }));
                resolve(noleggi);
            }
        });
    });
}

/**
 * getOldRental ritorna i noleggi passati dell'utente identificato dall'email
 */
exports.getOldRental = function (email){
    return new Promise((resolve, reject) => {
        const sql = `SELECT RId,Marca,Modello,Categoria,GiornoInizio,GiornoFine,Prezzo FROM NOLEGGI AS N,CARS AS C 
                        WHERE Email=? AND C.CId=N.CId AND GiornoFine<"${moment().format("YYYY-MM-DD")}"`;
        db.all(sql, [email], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                //rows = rows.filter((row)=> moment(row.GiornoFine).isBefore(moment()));
                let noleggi = rows.map((noleggio) => ({
                    "RId" : noleggio.RId,
                    "Marca" : noleggio.Marca,
                    "Modello" : noleggio.Modello,
                    "Categoria" : noleggio.Categoria,
                    "GiornoInizio" : noleggio.GiornoInizio,
                    "GiornoFine" : noleggio.GiornoFine,
                    "Prezzo" : noleggio.Prezzo
                }));
                resolve(noleggi);
            }
        });
    });
}
/**
 * createRental crea un nuovo noleggio con i parametri scelti dall'utenti ed assegna in modo automatico un veicolo 
 */
exports.createRental = function(rental){
    return new Promise((resolve,reject)=>{
        getCars(rental,rental.Email)
        .then((results)=>{
            const sql = "INSERT INTO NOLEGGI(CId,Email,GiornoInizio,GiornoFine,EtaGuidatore,GuidatoriAddizionali,KmStimati,AssicurazioneExtra,Prezzo) VALUES (?,?,?,?,?,?,?,?,?)";
            db.all(sql,[results.CId,rental.Email,rental.dataInizio,rental.dataFine,rental.EtaGuidatore,rental.guidatoriAddizionali,rental.KmStimati,rental.assicurazioneExtra,results.Prezzo],(err,rows)=>{
                if (err)
                    reject(err);
                else {
                    resolve(null);
                }
            }
            )
        })
    });
    
}
/**
 * getCategories ritorna le categorie presenti nel db
 */
exports.getCategories = function(){
    return new Promise ((resolve,reject)=>{
        const sql = "SELECT DISTINCT Categoria FROM CARS";
        db.all(sql,[],(err,rows)=>{
            if (err)
                reject(err);
            else{
                let categorie = rows.map((row) => row.Categoria);
                resolve(categorie);
            }
        })
    })
}

/**
 * getBrands ritorna le marche presenti nel db
 */
exports.getBrands = function(){
    return new Promise ((resolve,reject)=>{
        const sql = "SELECT DISTINCT Marca FROM CARS";
        db.all(sql,[],(err,rows)=>{
            if (err){
                reject(err);
            }
            else{
                let marche = rows.map((row) => row.Marca);
                resolve(marche);
            }
        })
    })
}
/**
 * deleteRental elimina il noleggio con id passato come parametro
 */
exports.deleteRental = function (id,email) {
    //fa una sorta di validazione per cui elimina solo i noleggi dell'utente e futuri
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM NOLEGGI WHERE RId = ? AND Email=? AND GiornoInizio>?';
        db.run(sql, [id,email,moment().format("YYYY-MM-DD")], (err) => {
            if (err)
                reject(err);
            else 
                resolve(null);
                
            
        })
    })
    
}