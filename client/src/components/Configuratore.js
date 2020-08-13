import React from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import API from "../api/API"
import moment from "moment"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Container from "react-bootstrap/Container"
import OptionalErrorMsg from"./OptionalErrorMsg"
import Spinner from "react-bootstrap/Spinner"
/**
 * Configuratore è il componente che gestisce la configurazione interattiva dei parametri del noleggio
 */
class Configuratore extends React.Component {
    /**
     * il costruttore setta lo stato iniziale con dei parametri di default
     */
    constructor(props){
        super(props);
        this.state={categorie : "",numDisponibili: "",prezzo : "",loading: true,fetchError :null,validationError : false,submitted : false,
                    categoria : "",dataInizio : moment().format("YYYY-MM-DD"), dataFine : moment().format("YYYY-MM-DD"), KmStimati : "Meno di 50", 
                    EtaGuidatore : "Inferiore a 25 anni",guidatoriAddizionali : "No", assicurazioneExtra : "No"}

    }
    //Nella componentDidMount si contatta il server per ottenere le categorie disponibili 
    componentDidMount(){
        API.getAllCategories().then(
            (categorie)=>{
              this.setState({categorie :categorie,categoria : categorie[0]},this.getInfo);
              this.setState({loading : false})
            }
          ).catch((err)=>{
            this.setState({fetchError : err})
            this.setState({loading : false});
          })
          
      };
    /**
     * getInfo è una callback richiamata per ottenere informazioni riguardante all'attuale configurazione scelta dell'utente dal server
     */
    getInfo = ()=>{
        if(moment(this.state.dataInizio).isAfter(moment(this.state.dataFine),"days")){
            this.setState({validationError : true,loading : false});
            return;
        }
        API.getConfigurationInfo(this.state.categoria,this.state.dataInizio,this.state.dataFine,this.state.KmStimati,this.state.EtaGuidatore,this.state.guidatoriAddizionali,this.state.assicurazioneExtra)
            .then((result)=>{
                this.setState({numDisponibili : result.NumDisponibili,prezzo:result.Prezzo,loading : false})
            }).catch((err)=>{
                if(err === "Sessione scaduta"){
                    this.props.setUserDisconnected()
                    return;
                }
                this.setState({fetchError: true})})
    }
    /**
     * updateField aggiorna lo stato ad ogni cambiamento del form
     */
    updateField = (name, value) => {
        this.setState({[name]: value,loading : true},this.getInfo);
        
    }
    /**
     *handleSubmit gestisce la sottomissione del form
     */
    handleSubmit = (event) => {
        event.preventDefault();
        //la validazione consiste nella verifica se il giorno di inizio è precedente o uguale al giorno di fine
        //il form è guidato e l'utente non può inserire altri valori (ATTENZIONE: non è vero e infatti lato server si fa una validazione più approfondita) 
        const form = event.currentTarget;
        if (!form.checkValidity()) {
        form.reportValidity();
        } else {
        if (moment(this.state.dataInizio).isAfter(moment(this.state.dataFine),"days")){
            this.setState({validationError : true});
            return;
        }
        this.setState({submitted : true});
        }
    }
    /**
     * handleClose gestisce la chiusura del modal nel momento in cui l'utente clicca su "Chiudi"
     */
    handleClose = ()=>{
        this.setState({submitted : false,creazioneSuccesso : false,loading : false,fetchError: null},this.getInfo);
    }
    /**
     * handlePayment gestisce il pagamento e contatta il server . Se c'è stato un errore durante la comunicazione con il server visualizza un errore
     */
    handlePayment = (codiceCarta,nome,CVV)=>{
        this.setState({loading : true});
         API.acceptRentalAndPay(this.state.categoria,this.state.dataInizio,this.state.dataFine,this.state.KmStimati,this.state.EtaGuidatore,
            this.state.guidatoriAddizionali,this.state.assicurazioneExtra,codiceCarta,nome,CVV,this.state.prezzo)
        .then(()=>this.setState({submitted: false,creazioneSuccesso : true}))
        .catch((err)=>this.setState({fetchError : err}))
    }
    /**
     * cancelErrorMsg gestisce la chiusura del messaggio di errore da parte dell'utente
     */
    cancelErrorMsg =()=>{
        this.setState({validationError : false, dataFine : this.state.dataInizio},this.getInfo);
    }
    render() {
        return(
        <>
        {this.state.submitted &&  //se il form è sottomesso allora visualizza il modal di pagamento
        <ModalPagamento categoria={this.state.categoria} dataInizio={this.state.dataInizio} dataFine={this.state.dataFine} 
            KmStimati={this.state.KmStimati} EtaGuidatore = {this.state.EtaGuidatore} guidatoriAddizionali={this.state.guidatoriAddizionali} 
            assicurazioneExtra={this.state.assicurazioneExtra} prezzo={this.state.prezzo} handleClose={this.handleClose} handlePayment={this.handlePayment}/>
        }
        {this.state.creazioneSuccesso && //se il pagamento ha avuto successo visualizza un modal dove si informa l'utente sul successo del pagamento
        <Modal show={true} onHide={this.handleClose} size="sm">
            <Modal.Body>
                <p>Pagamento avvenuto con successo!</p>
            </Modal.Body>
            <Button variant="warning" onClick={()=>this.handleClose()} >Chiudi</Button>
        </Modal>
    }
        {this.state.fetchError !== null && //se c'è stato un errore di comunicazione con il server visualizza un errore
        <Modal show={true} onHide={this.handleClose} size="sm">
        <Modal.Body>
            <OptionalErrorMsg errorMsg="Impossibile contattare il server" cancelErrorMsg={this.handleClose}/>
        </Modal.Body>
        <Button variant="warning" onClick={()=>this.handleClose()} >Chiudi</Button>
    </Modal>
        }
        <Container fluid id="containerConfiguratore">
        <Form onSubmit={(event)=>this.handleSubmit(event)}>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>Categoria:</Form.Label>
                        <Form.Control as="select"  name="categoria" custom required value = {this.state.categoria} onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}>
                        {this.state.categorie && this.state.categorie.map((categoria)=><option key={categoria}>{categoria}</option>)} 
                        </Form.Control>
                        </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Giorno inizio:</Form.Label>
                    <Form.Control type="date"
                        name="dataInizio"
                        value= {this.state.dataInizio}
                        min={moment().format("YYYY-MM-DD")} 
                        onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)} required/>
                </Col>
                <Col>
                    <Form.Label>Giorno fine:</Form.Label>
                    <Form.Control type="date"
                        name="dataFine" required
                        value= {this.state.dataFine}
                        min={moment().format("YYYY-MM-DD")} 
                        onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}/>
                </Col>
            </Row>
            <Row>
                <Col sm="2"/>
                <Col>
                {this.state.validationError && <OptionalErrorMsg errorMsg={"Data fine precedente a data inizio!"} cancelErrorMsg={this.cancelErrorMsg}/>}
                </Col>
                <Col sm="2"/>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Chilometri giornalieri stimati:</Form.Label>
                    <Form.Control as="select" name="KmStimati"custom  required value={this.state.KmStimati} onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}>
                        <option>Meno di 50</option>
                        <option>Meno di 150</option>
                        <option>Illimitati</option>
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Label>Età guidatore:</Form.Label>
                    <Form.Control as="select"  name="EtaGuidatore" custom required value = {this.state.EtaGuidatore} onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}>
                        <option>Inferiore a 25 anni</option>
                        <option>Superiore a 65 anni</option>
                        <option>Compreso tra 25 e 65 anni</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                <Col>
                <Form.Group>
                    <Form.Label>Guidatori addizionali:</Form.Label>
                    <Form.Control as="select"  name="guidatoriAddizionali" custom required value = {this.state.guidatoriAddizionali} onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}>
                        <option>Si</option>
                        <option>No</option>
                    </Form.Control>
                    
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Label>Assicurazione Extra:</Form.Label>
                    <Form.Control as="select"  name="assicurazioneExtra" custom required value = {this.state.assicurazioneExtra} onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)}>
                        <option>Si</option>
                        <option>No</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Numero auto disponibili:</Form.Label>
                    <Form.Control value = {this.state.numDisponibili } disabled readOnly />
                    {this.state.loading &&
                         <Spinner animation="border" variant="warning" size="sm"/>
                    }
                </Col>
                <Col>
                    <Form.Label>Prezzo noleggio:</Form.Label>
                    <Form.Control value = {this.state.prezzo } disabled readOnly />
                    {this.state.loading &&
                        <Spinner animation="border" variant="warning" size="sm"/>
                    }
                </Col>
            </Row>
            <br></br>
                <Row>
                <Col>
                <Button variant="warning" type="submit" disabled={this.state.validationError || this.state.numDisponibili===0}>
                    Prosegui con il pagamento!       
                </Button>
                </Col>

                </Row>
        </Form>
        </Container>
        </>
            )};
}
/**
 * ModalPagamento è un componente che gestisce il modal per il pagamento
 */
function ModalPagamento(props){
    return (
        <Modal show={true} onHide={props.handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Pagamento Noleggio</Modal.Title>
                </Modal.Header>

            <Modal.Body>
                <p>Riepilogo pagamento :</p>
                <small>Categoria : {props.categoria}</small>
                <br/><small>Data inizio : {props.dataInizio}</small>
                <br/><small>Data fine : {props.dataFine}</small>
                <br/><small>Chilometri giornalieri stimati : {props.KmStimati}</small>
                <br/><small>Età guidatore : {props.EtaGuidatore}</small>
                <br/><small>Guidatori addizionali : {props.guidatoriAddizionali}</small>
                <br/><small>AssicurazioneExtra : {props.assicurazioneExtra}</small>
                <br/><small>Prezzo : {props.prezzo}</small>
                <FormPagamento onClose={props.handleClose} onSubmit={props.handlePayment}/>
            </Modal.Body>
        </Modal>
    )
}
/**
 * FormPagamento è il form dove l'utente inserisce i dati utili al pagamento
 * Fa una validazione sulla presenza dei campi obbligatori
 */
class FormPagamento extends React.Component{
    constructor(props){
        super(props);
        this.state={codiceCarta : "" , nomeCompleto : "", codiceCVV : ""};
    }
    updateField = (name, value) => {
        this.setState({[name]: value},this.getInfo);
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
        form.reportValidity();
        } else {
            this.props.onSubmit(this.state.codiceCarta,this.state.nomeCompleto,this.state.codiceCVV);
    }
}

    render(){
        return (
            <Form onSubmit={(event)=>this.handleSubmit(event)}>
                    <Form.Group >
                        <Form.Label>Numero Carta:</Form.Label>
                        <Form.Control type="text" name="codiceCarta" onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)} required/>
                    </Form.Group>

                    <Form.Group >
                        <Form.Label>Nome e cognome dell' intestatario della carta: </Form.Label>
                        <Form.Control type="text" name="nomeCompleto" onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)} required/>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label>Codice CVV</Form.Label>
                        <Form.Control type="text" name="codiceCVV" onChange={(ev)=>this.updateField(ev.target.name,ev.target.value)} required/>
                    </Form.Group>
                    <Form.Group>
                    <Row>
                    <Col sm="2">
                    <Button variant="secondary" onClick={()=>this.props.onClose()} >Chiudi</Button>
                    </Col>
                    <Col sm="2">
                    <Button variant="warning" type = "submit">Paga</Button>
                    </Col>
                    </Row>
                    </Form.Group>
            </Form>
        );
    }
}
export default Configuratore;