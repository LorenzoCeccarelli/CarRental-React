import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import {NavLink} from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import {Logout} from "./Login";
import Image from "react-bootstrap/Image"

/**
 * Header rappresenta la barra di navigazione e riceve da App diverse proprietà
 * @param {*} props 
 * props.isAuth fornisce l'indicazione se l'utente è loggato oppure no
 * props.user fornisce le informazioni sull'utente loggato
 * props.userLogout è la callback da chiamare quando l'utente clocca sul bottone Logout
 */
function Header(props){
    return (
        <Navbar  expand="lg" id="navbar">
            <Navbar.Brand >
            <Image width="30" height="30" className="img-button" src="/svg/logo.svg"/>
                <strong>Car Rental</strong>
            </Navbar.Brand>
            {!props.isAuth && 
            //Navbar nel caso in cui l'utente non è autenticato
            <>
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/catalogo"> Catalogo</Nav.Link> 
            </Nav>
            <Nav className="ml-md-auto">
                <Nav.Link as = {NavLink} to = "/login">Login</Nav.Link>
                    <svg className="bi bi-people-circle" width="30" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z"/>
                    <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clipRule="evenodd"/>
                    </svg>
            </Nav>
            </>}
            {props.isAuth && 
            //Navbar nel caso in cui l'utente è autenticato
            <>
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/storicoNoleggi">Storico Noleggi</Nav.Link> 
            </Nav>
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/prossimiNoleggi">Noleggi in programma</Nav.Link> 
            </Nav>
            <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/configuratore">Configuratore</Nav.Link> 
            </Nav>
            <Nav className="ml-md-auto">
                <Nav.Link eventKey="disabled" disabled>
                {props.user.name}
                </Nav.Link>
                <Logout user = {props.user} userLogout={props.userLogout}/>
                    <svg className="bi bi-people-circle" width="30" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z"/>
                    <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clipRule="evenodd"/>
                    </svg>
            </Nav>
            </>}
        </Navbar>
    )
}

export default Header;