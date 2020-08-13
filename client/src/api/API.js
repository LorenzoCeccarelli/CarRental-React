/**
 * API.js contiene tutte le API per la comunicazione con il server
 */
const baseURL = "/api";

/**
 * isAuthenticated informa il chiamante se esiste o meno un utente già loggato
 */
async function isAuthenticated(){
    let url = "/user";
    const response = await fetch(baseURL + url);
    const userJson = await response.json();
    if(response.ok){
        return userJson;
    } else {
        let err = {status: response.status, errObj:userJson};
        throw err;  // An object with the error coming from the server
    }
}
/**
 * userLogin comunca al server le credenziale dell'utente e ritorna successo o insuccesso (con eventuale cause dell'insuccesso)
 */
async function userLogin(email, password) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email, password: password}),
        }).then((response) => {
            if (response.ok) {
                response.json().then((user) => {
                    resolve(user);
                });
            } else {
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}
/**
 * userLogout gestisce il logout nformando opportunamente il server
 */
async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                reject(null);
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}
/**
 * getAllCars effettua una GET al server per ottenere la lista di tutte le auto
 */
async function getAllCars(){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + '/allCars').then((response)=>{
            if(response.ok)
                resolve(response.json());
                else reject();
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * getAllCategories effettua una GET al server per ottenere la lista di tutte le categorie
 */
async function getAllCategories(){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + '/categories').then((response)=>{
            if(response.ok)
                resolve(response.json());
                else reject();
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * getAllBrands effettua una GET al server per ottenere la lista di tutte le marche
 */
async function getAllBrands(){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + '/brands').then((response)=>{
            if(response.ok)
                resolve(response.json());
                else reject();
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * getStorico effettua una GET al server per ottenere la lista dello storico dei noleggi
 */
async function getStorico(){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + '/noleggi/storico').then((response)=>{
            if(response.ok)
                resolve(response.json());
            else if (response.status === 401)
                    reject("Sessione scaduta")
            else reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] })
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * getNoleggiFuturi effettua una GET al server per ottenere la lista dei noleggi futuri
 */
async function getNoleggiFuturi(){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + '/noleggi/futuri').then((response)=>{
            if(response.ok)
                resolve(response.json());
                else if (response.status === 401)
                    reject("Sessione scaduta")
            else reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] })
        }).catch((err)=>{reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * deleteRental fa una DELETE al server eliminare il noleggio con identificatore uguale a id
 */
async function deleteRental(id){
    return new Promise((resolve,reject)=>{
        fetch(baseURL + `/noleggio/${id}`,{
            method : 'DELETE'
        }).then((response)=>{
            resolve(null);
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * getConfigurationInfo fa una GET al server per ottenere il numero di auto disponibili e il prezzo per la configurazione inviata
 */
async function getConfigurationInfo(categoria,dataInizio,dataFine,KmStimati,EtaGuidatore,guidatoriAddizionali,assicurazioneExtra){
    return new Promise((resolve,reject)=>{
        if (guidatoriAddizionali==="Si")
            guidatoriAddizionali="1";
        else guidatoriAddizionali="0";
        if (assicurazioneExtra==="Si")
            assicurazioneExtra="1";
        else assicurazioneExtra="0";
        fetch(baseURL + `/cars/?categoria=${categoria}&dataInizio=${dataInizio}&dataFine=${dataFine}&KmStimati=${KmStimati}&EtaGuidatore=${EtaGuidatore}&guidatoriAddizionali=${guidatoriAddizionali}&assicurazioneExtra=${assicurazioneExtra}`).then((response)=>{
            if(response.ok)
                resolve(response.json());
                else if (response.status === 401)
                    reject("Sessione scaduta")
            else reject()
        }).catch((err)=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
    });
};
/**
 * acceptRentalAndPay effettua due richieste al server
 * POST per informare il server sul pagamento dell'utente (fake)
 * POST per aggiungere un nuovo noleggio
 */
async function acceptRentalAndPay(categoria,dataInizio,dataFine,KmStimati,EtaGuidatore,guidatoriAddizionali,assicurazioneExtra,codiceCarta,nome,CVV,prezzo){
    return new Promise((resolve,reject)=>{
        if (guidatoriAddizionali==="Si")
            guidatoriAddizionali="1";
        else guidatoriAddizionali="0";
        if (assicurazioneExtra==="Si")
            assicurazioneExtra="1";
        else assicurazioneExtra="0";
        fetch(baseURL + "/pay",{
            method : 'POST',
            headers : {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({codiceCarta : codiceCarta, nomeCompleto : nome, CVV : CVV, prezzo : prezzo})
        }).then(()=>{
            fetch(baseURL + `/noleggio/`,{
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({categoria : categoria,dataInizio : dataInizio, dataFine : dataFine, KmStimati : KmStimati, EtaGuidatore : EtaGuidatore, guidatoriAddizionali : guidatoriAddizionali, assicurazioneExtra : assicurazioneExtra}),
            }).then((response)=>{
                if(response.ok)
                    resolve(null);
                    else reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] });
            }).catch(()=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
        }).catch(()=>{ reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
        
    })
}
const API = { isAuthenticated, userLogin, userLogout,getAllCars,getAllCategories,getAllBrands,getStorico,getNoleggiFuturi,deleteRental,getConfigurationInfo,acceptRentalAndPay} ;
export default API;