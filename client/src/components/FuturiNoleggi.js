import React,{useState,useEffect} from "react";
import API from "../api/API";
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner"
import OptionalErrorMsg from "./OptionalErrorMsg"
import moment from "moment"
//check, notCheck e trash sono icone per la visualizzazione delle info riguardanti i noleggi
const check = <svg className="bi bi-check" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
            </svg>;
const notCheck= <svg className="bi bi-x" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"/>
                    <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"/>
                </svg>;
const trash = <svg className="bi bi-trash" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
/**
 * FuturiNoleggi rappresenta il componente per la gestione della visualizzazione dei noleggi futuri dell'utente 
 */
function FuturiNoleggi(props){
    const [noleggi,setNoleggi] = useState(null); //contiene la lista dei noleggi da visualizzare
    const [fetchError,setFetchError] = useState(false); //fornisce l'indicazione se è avvenuto un errore oppure no durante la comunicazione con il server
    const [loading,setLoading] = useState(true); //fornisce l'indicazione riguardante il caricamento dei dati dal server

    //UseEffect che nel momento della creazione del componente carica i noleggi dal database
    useEffect(()=>{
            API.getNoleggiFuturi().then(
                (noleggi) => {
                    setNoleggi(noleggi);
                    setLoading(false);
                }
            ).catch((err) => {
                setFetchError(true);
                if(err==="Sessione scaduta"){
                    props.setUserDisconnected()
                    return;
                }
                setLoading(false);
            })
        
          
    }, [props]);
    /**
     * deleteRental rimuove il noleggio con identificatore uguale  id dalla lista dei noleggi locale (se tutto è andato a buon fine)
     * @param {*} id 
     */
    const deleteRental = (id) =>{
        API.deleteRental(id).then(()=>{
            setNoleggi((noleggi)=>noleggi.filter((noleggio)=>noleggio.RId!==id))
        }).catch((err)=>setFetchError(err));
    };
    //se è avvenuto un errore visualizzo un messaggio di errore
    if (!loading && fetchError)
        return <OptionalErrorMsg errorMsg="Impossibile contattare il server"/>
    //senno visualizzo la tabella con le informazioni sul noleggio
    if (!loading && !fetchError)
    return (
        <Table>
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Modello</th>
                    <th>Categoria</th>
                    <th>GiornoInizio</th>
                    <th>GiornoFine</th>
                    <th>Età Guidatore</th>
                    <th>Guidatori Addizionali</th>
                    <th>kmStimati</th>
                    <th>AssicurazioneExtra</th>
                    <th>Prezzo</th>
                    
                </tr>
            </thead>
            <tbody>
                {noleggi.map((noleggio) => <NoleggioFuturoItem key={noleggio.RId} noleggio={noleggio} deleteRental={deleteRental}/>)}
            </tbody>
        </Table>
        )
    //se sta caricando visualizzo uno spinner
    else return <Spinner animation="border" variant="warning" size="lg"/>;
    }
/**
 * NoleggioFuturoItem rappresenta un singolo noleggio con tutte le sue informazioni
 */
function NoleggioFuturoItem(props){
    if (props.noleggio.GuidatoriAddizionali==="1")
        props.noleggio.GuidatoriAddizionali=check;
    else props.noleggio.GuidatoriAddizionali=notCheck;
    if (props.noleggio.AssicurazioneExtra==="1")
        props.noleggio.AssicurazioneExtra=check;
    else props.noleggio.AssicurazioneExtra=notCheck;
    return (
        <tr>
        <td>{props.noleggio.Marca}</td>
        <td>{props.noleggio.Modello}</td>
        <td>{props.noleggio.Categoria}</td>
        <td>{props.noleggio.GiornoInizio}</td>
        <td>{props.noleggio.GiornoFine}</td>
        <td>{props.noleggio.EtaGuidatore}</td>
        <td>{props.noleggio.GuidatoriAddizionali}</td>
        <td>{props.noleggio.KmStimati}</td>
        <td>{props.noleggio.AssicurazioneExtra}</td>
        <td>{props.noleggio.Prezzo}</td>
        <td><ControlItem id={props.noleggio.RId} deleteRental={props.deleteRental} giornoInizio={props.noleggio.GiornoInizio} giornoFine={props.noleggio.GiornoFine}/></td>
    </tr>
    )
}
/**
 * ControlItem è un componente che gestisce la cancellazione del noleggio
 */
function ControlItem(props){
    if (moment(props.giornoInizio).isSameOrBefore(moment(),"days") && moment(props.giornoFine).isSameOrAfter(moment(),"days"))
        return <strong>IN CORSO!</strong>
    return <Button variant="warning" onClick ={()=>props.deleteRental(props.id)}>
            {trash}
           </Button>
}
export default FuturiNoleggi;