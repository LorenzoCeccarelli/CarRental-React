import React from 'react';
import Alert from "react-bootstrap/Alert"
/**
 * OptionalErrorMsg è un componente usato per la visualizzazione di un errore
 */
function OptionalErrorMsg(props) {
    if (props.errorMsg)
        return <Alert variant="danger">
            <strong>Error:</strong> <span>{props.errorMsg}</span>
            <button type='button' className='close' aria-label='Close'
                onClick={props.cancelErrorMsg}> 
                <span aria-hidden='true'>&times;</span>
            </button>
        </Alert>;
    else
        return null;
}
export default OptionalErrorMsg;