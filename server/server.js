"use strict";

//import
const express = require('express');
const carsDao = require('./cars_dao');
const userDao = require('./user_dao');
const morgan = require('morgan'); // logging middleware
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {check, validationResult} = require('express-validator'); // validation library
const moment = require('moment')
//secret
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';

//expire timer
const expireTime = 300; //seconds

// Authorization error
const authErrorObj = { errors: [{  'param': 'Server', 'msg': 'Authorization error' }] };

//create server app
const app = express();
const PORT = 3001;


// Set-up logging
app.use(morgan('tiny'));

// Process body content
app.use(express.json());

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    userDao.getUser(email)
      .then((user) => {
        //CHECK IF AUTHENTICATION FAILS
        if(user === undefined) {
            res.status(404).send({
                errors: [{ 'param': 'Server', 'msg': 'Invalid e-mail' }] 
              });
        } else {
            if(!userDao.checkPassword(user, password)){
                res.status(401).send({
                    errors: [{ 'param': 'Server', 'msg': 'Wrong password' }] 
                  });
            } else {
                //AUTHENTICATION SUCCESS
                const token = jsonwebtoken.sign({ email: user.email }, jwtSecret, {expiresIn: 100*expireTime});
                res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
                res.json({name: user.name});
            }
        } 
      }).catch(

        // Delay response when wrong user/pass is sent to avoid fast guessing attempts
        (err) => {
            new Promise((resolve) => {setTimeout(resolve, 1000)}).then(() => res.status(401).json(authErrorObj))
        }
      );
  });

app.use(cookieParser());

//l'endpoint di logout elimina il cookie
app.post('/api/logout', (req, res) => {
    res.clearCookie('token').end();
});

//GET /allCars ritorna la lista di tutte le auto nel database o errore
app.get('/api/allCars', (req, res) => {
    carsDao.getAllCars()
        .then((cars) => {
            res.json(cars);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
}); 
//GET /categories
//Ritorna le categorie presenti nel db (Al massimo A,B,C,D,E)
app.get("/api/categories",(req,res)=>{
  carsDao.getCategories()
    .then((categories)=>{
      res.status(200).json(categories);
    })
    .catch((err)=>{
      res.status(500).json({
        errors : [{'msg' : err}]
      });
    });
});

//GET /brands
//Ritorna le marche presenti nel db 
app.get("/api/brands",(req,res)=>{
  carsDao.getBrands()
    .then((brands)=>{
      res.status(200).json(brands);
    })
    .catch((err)=>{
      res.status(500).json({
        errors : [{'msg' : err}]
      });
    });
});

// Da qui le gli endpoints richiedono autenticazione
app.use(
    jwt({
      secret: jwtSecret,
      getToken: req => req.cookies.token
    })
  );
  
// middleware che ritorna un oggetto in caso di errore
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(authErrorObj);
    }
  });

// AUTHENTICATED REST API endpoints

//GET /user
//needed to know which is the user name when the user is already authenticated and
// somebody reloaded the page with the browser
app.get('/api/user', (req,res) => {
    //Estrae la mail dal payload JWT
    const email = req.user && req.user.email;
    userDao.getUser(email) //se l'utente non  è autorizzato jwt stopperà 
        .then((user) => {
            res.json({name: user.name, surname:user.surname});
        }).catch(
        (err) => {
         res.status(401).json(authErrorObj);
        }
      );
});

//GET /cars
//Ritorna il numero di auto disponibili che soddisfano i requisiti e il prezzo del noleggio
//La validazione è fatta nel dao
app.get('/api/cars',[ 
  check('categoria').isString(),
  check('dataInizio').isString(),
  check('dataFine').isString(),
  check('guidatoriAddizionali').isInt({min:0,max:1}),
  check('KmStimati').isString().isIn(['Meno di 50','Meno di 150','Illimitati']),
  check('EtaGuidatore').isString().isIn(['Inferiore a 25 anni','Superiore a 65 anni','Compreso tra 25 e 65 anni']),
  check('assicurazioneExtra').isInt({min:0,max:1}),
  ],(req,res)=>{
  const emailUser = req.user && req.user.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  if (moment(req.dataFine).isBefore(moment(req.dataInizio),"days"))
    reject({"err" : "Parametri non validi"});
    const email = req.user && req.user.email;
    carsDao.getCars(req.query,req.user.email)
        .then((rentalInfo) => {
            res.json({"NumDisponibili" : rentalInfo.numDisponibili,
                      "Prezzo" : rentalInfo.Prezzo});
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

//POST /pay
//E' l'endpoint fake di pagamento che ritorna ok 
app.post('/api/pay',[ 
  check('codiceCarta').notEmpty(),
  check('nomeCompleto').notEmpty(),
  check('CVV').notEmpty(),
  check('prezzo').notEmpty(),
  ],(req,res)=>{
  const errors = validationResult(req);
  const email = req.user && req.user.email;
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  return res.status(200).end();
});

//GET /noleggi/futuri
//Ritorna lo storico dei noleggi futuri
app.get("/api/noleggi/futuri",(req,res)=>{
  const email = req.user && req.user.email;
  carsDao.getFutureRental(email)
    .then((noleggiFuturi)=>{
      res.json(noleggiFuturi);
    })
    .catch((err)=>{
      res.status(500).json({
        errors : [{'msg' : err}]
      });
    });
});

//GET /noleggi/storico
//Ritorna lo storico dei noleggi passati
app.get("/api/noleggi/storico",(req,res)=>{
  const email = req.user && req.user.email;
  carsDao.getOldRental(email)
    .then((noleggiPassati)=>{
      res.json(noleggiPassati);
    })
    .catch((err)=>{
      res.status(500).json({
        errors : [{'msg' : err}]
      });
    });
});

//POST /noleggio
//Nel body ci sono tutte le informazioni che caratterizzano un noleggio
//Effettua una verifica che i parametri siano corretti
app.post("/api/noleggio",[ 
  check('categoria').isString(),
  check('dataInizio').isString(),
  check('dataFine').isString(),
  check('guidatoriAddizionali').isInt({min:0,max:1}),
  check('KmStimati').isString().isIn(['Meno di 50','Meno di 150','Illimitati']),
  check('EtaGuidatore').isString().isIn(['Inferiore a 25 anni','Superiore a 65 anni','Compreso tra 25 e 65 anni']),
  check('assicurazioneExtra').isInt({min:0,max:1}),
  ],(req,res)=>{
  const emailUser = req.user && req.user.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  carsDao.createRental({
    Email: emailUser,
    categoria : req.body.categoria,
    dataInizio: req.body.dataInizio,
    dataFine: req.body.dataFine,
    guidatoriAddizionali: req.body.guidatoriAddizionali,
    KmStimati: req.body.KmStimati,
    EtaGuidatore :req.body.EtaGuidatore,
    assicurazioneExtra: req.body.assicurazioneExtra,
  }).then((result) => {res.status(200).end();})
    .catch((err) =>{ console.log(err)
      res.status(503).json({
      errors: [{'param': 'Server', 'msg': 'Database error'}],
    })});
});


//DELETE /noleggio/<rentalId>
app.delete('/api/noleggio/:rentalId', (req,res) => {
  carsDao.deleteRental(req.params.rentalId, req.user.email)
      .then((result) => res.status(204).end())
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          errors: [{'param': 'Server', 'msg': err}],
      })
      });
});



app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));