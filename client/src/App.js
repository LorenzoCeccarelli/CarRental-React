import React from 'react';
import './App.css';
import {Redirect, Route} from 'react-router-dom';
import {Switch} from 'react-router';
import Container from 'react-bootstrap/Container';
import API from './api/API';
import { withRouter } from 'react-router-dom';
import Header from './components/Header';
import {Login} from "./components/Login";
import Catalogo from "./components/Catalogo"
import Configuratore from "./components/Configuratore"
import StoricoNoleggi from "./components/StoricoNoleggi"
import FuturiNoleggi from "./components/FuturiNoleggi"
import Spinner from "react-bootstrap/Spinner"


class App extends React.Component {
  /**
   * authUser rappresenta l'utente loggato con nome e cognome, isAuth fornisce l'indicazione se l'utente è loggato
   * o oppure no, loading è un boolean che fornisce indicazioni riguardo al caricamento della pagina/dati dal server
   */
  constructor(props){
    super(props);
    this.state={authUser : null,isAuth : false,loading : true};
  }

  //ComponentDidMount viene eseguita alla creazione di App verifica se l'utente è autenticato o no
  componentDidMount(){
    API.isAuthenticated().then(
      (user)=>{
        this.setState({authUser:user,isAuth : true,loading : false})
      }
    ).catch((err)=>{
      this.setState({loading : false})
    })
  }

  /**
   * setLoggedInUser setta nello stato le informazioni sull'utente loggato
   */
  setLoggedInUser = (name,email) => {
    const user = {name : name, email : email}
    this.setState({authUser : user,isAuth : true, loading : false})
    //props.history.push("/configuratore")
    
}
  /**
   * userLogout esegue il logout dall'applicazione e cambia lo stato dell'app 
   */
  userLogout = () => {
  API.userLogout().then(
      () => {this.setState({authUser : null, isAuth : false}); }
  );
  }
  /**
   * setUserDisconnected è simile ad userLogout ma non contatta l'API in quanto il token è gia scaduto
   * e di conseguenza l'utente non è più loggato
   */
  setUserDisconnected = ()=>{
  this.setState({authUser : null,isAuth: false});
  }
  render(){
    //se la pagina sta caricando ritorna uno Spinner
    if(this.state.loading)
      return (<Spinner animation="border" variant="warning" size="lg"/>);

    return (
      <Container fluid  >
          <Header isAuth={this.state.isAuth} user={this.state.authUser} userLogout={this.userLogout}/> 
          <Container fluid id="containerMainContent">
            <Switch>
              <Route  path="/catalogo" render={()=>{
                if (!this.state.isAuth)
                  return <Catalogo/>
                else 
                  return <Redirect to="/configuratore"/>
              }}>
              </Route>
              <Route path='/configuratore' render={()=>{
                if (!this.state.isAuth)
                return <Redirect to="/login"/>
              else 
                return <Configuratore setUserDisconnected={this.setUserDisconnected}/>
              }}>
              </Route>
              <Route path='/storicoNoleggi' render={()=>{
                 if (!this.state.isAuth)
                 return <Redirect to="/login"/>
               else 
                 return <StoricoNoleggi setUserDisconnected={this.setUserDisconnected}/>
              }}>
                
              </Route>
              <Route path='/prossimiNoleggi' render={()=>{
                if (!this.state.isAuth)
                return <Redirect to="/login"/>
              else 
                return <FuturiNoleggi setUserDisconnected={this.setUserDisconnected}/>
              }}>
        
              </Route>
              <Route path="/login" render={()=>{
                if (!this.state.isAuth)
                return <Login setLoggedInUser={this.setLoggedInUser} />
              else 
                return <Redirect to="/configuratore"/>
              }}>
                </Route>
              <Route path='/' render={()=>{
                return  <Redirect to="/login"/>
              }}>
              </Route>
            </Switch>
            </Container>
      </Container>)
    }
}


export default withRouter(App);