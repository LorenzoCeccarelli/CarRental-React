import React, { useState} from 'react';
import  OptionalErrorMsg  from "../components/OptionalErrorMsg";

import { Redirect, Link } from 'react-router-dom';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import API from '../api/API';
/**
 * Login è il componente che gestisce la pagina di autenticazione  
 */
function Login(props) {

    const [loginSuccess, setLoginSuccess] = useState(false); //fornisce l'indicazione sul successo ( o no ) del login
    const [waitingLogin, setWaitingLogin] = useState(false); //fornisce l'indicazione se il componente sta comunicando con il server
    const [wrongLoginMsg, setWrongLoginMsg] = useState(false); //fornisce l'indicazione su una errata autenticazione da parte dell'utente

    /**
     * doLoginCall invia al server le credenziali inserite dall'utente e riceve dal server l'informazione su un eventuale successo o insuccesso
     */
    const doLoginCall = (email, pass) => {
        setWaitingLogin(true);
        API.userLogin(email, pass).then( (userObj) => {
            setWaitingLogin(false);
            setLoginSuccess(true);   // set state to redirect in render
            props.setLoggedInUser(userObj.name, email);  // keep success info in state at App level
        }).catch(
            () => {
                setWrongLoginMsg(true);
                setWaitingLogin(false);
            }
        );
    }
    /**
     * cancelLoginError è una callback chiamata nel momento in cui l'utente clicca sulla "x" del messaggio di errore
     */
    const cancelLoginErrorMsg = () => {
        setWrongLoginMsg(false);
    }
    //se la procedura di autenticazione ha avuo successo faccio una redirect a "/configuratore"
    if (loginSuccess) {
        return <Redirect to="/configuratore" />
    } else
    //senno visualizzo il form di login
        return <>
            <Container fluid id ="containerLogin">
            <Row>
            <LoginForm doLoginCall={doLoginCall} waitingLogin={waitingLogin} />
            </Row>
            <br></br>
            <Row>
                
            <OptionalErrorMsg errorMsg={wrongLoginMsg ? 'Username e/o password errata/e' : ''}
                cancelErrorMsg={cancelLoginErrorMsg} />
            </Row>
            </Container>
        </>;
}

/**
 * LoginForm è un componente che visualizza il form dove l'utente inserisce le credenziali
 */
function LoginForm(props) {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const updateUsernameField = (value) => {
        setUsername(value);
    }

    const updatePasswordField = (value) => {
        setPassword(value);
    }

    const doLogin = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity()) {
            props.doLoginCall(username, password);
        } else {
            form.reportValidity();
        }
    }

    const validateForm = (event) => {
        event.preventDefault();
    }

    return (
        <Form onSubmit={(event)=>validateForm(event)} >
                <Row>
                    <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type='email' required={true}
                        name='username'
                        value={username}
                        onChange={(ev) => updateUsernameField(ev.target.value)}
                    />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group>
                    <Form.Label >Password</Form.Label>
                    <Form.Control  type='password' required={true}
                        name='password'
                        value={password}
                        onChange={(ev) => updatePasswordField(ev.target.value)}
                    />
                </Form.Group>
                </Row>

                <Row>
                    <button type='button' className='btn btn-warning' disabled={props.waitingLogin}
                        onClick={doLogin}>Login</button>
                </Row>
            

        </Form>
    )

}

/**
 * Logout è un componente che gestisce il logout dell'utente
 */

function Logout(props) {
    if (props.user) {
        return <Link to='/login' className='btn btn-warning'
                            onClick={props.userLogout}>Logout</Link>
    } else
        return null;
}

export { Login, Logout };

