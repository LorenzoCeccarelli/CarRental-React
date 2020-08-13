import React,{useState,useEffect} from "react";
import API from "../api/API";
import Table from "react-bootstrap/Table"
import Spinner from "react-bootstrap/Spinner"
import OptionalErrorMsg from "./OptionalErrorMsg"
/**
 * StoricoNoleggi è un componente che gestisce lo storico dei noleggi dell'utente
 */
function StoricoNoleggi(props){
    const [noleggi,setNoleggi] = useState(null); //contiene la lista dei noleggi da visualizzare
    const [fetchError,setFetchError] = useState(null); //fornisce l'indicazione se è avvenuto un errore oppure no durante la comunicazione con il server
    const [loading,setLoading] = useState(true); //fornisce l'indicazione riguardante il caricamento dei dati dal server

    //UseEffect che nel momento della creazione del componente carica lo storico dal database
    useEffect(()=>{
        API.getStorico().then(
          (noleggi)=>{
            setNoleggi(noleggi);
            setLoading(false);
          }
        ).catch((err)=>{
            setFetchError(err);
            if(err==="Sessione scaduta"){
                props.setUserDisconnected();
                return;
            }

          
          setLoading(false);
        })
        
          
    }, [props]);
    //se è avvenuto un errore visualizzo un messaggio di errore
    if (fetchError !==null)
        return <OptionalErrorMsg errorMsg="Impossibile contattare il server"/>
    //senno visualizzo la tabella con le informazioni sul noleggio
    if (!loading)
    return (
        <Table>
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Modello</th>
                    <th>Categoria</th>
                    <th>GiornoInizio</th>
                    <th>GiornoFine</th>
                    <th>Prezzo</th>
                </tr>
            </thead>
            <tbody>
                {noleggi.map((noleggio) => <StoricoItem key={noleggio.RId} noleggio={noleggio} />)}
            </tbody>
        </Table>
        )
    else return <Spinner animation="border" variant="warning" size="lg"/>;
    }
/**
 * NoleggioFuturoItem rappresenta un singolo noleggio con tutte le sue informazioni
 */
function StoricoItem(props){
    return (
        <tr>
        <td>{props.noleggio.Marca}</td>
        <td>{props.noleggio.Modello}</td>
        <td>{props.noleggio.Categoria}</td>
        <td>{props.noleggio.GiornoInizio}</td>
        <td>{props.noleggio.GiornoFine}</td>
        <td>{props.noleggio.Prezzo}</td>
    </tr>
    )
}
export default StoricoNoleggi;