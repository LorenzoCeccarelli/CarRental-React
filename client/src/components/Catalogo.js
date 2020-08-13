import React,{useState,useEffect} from 'react';
import Container from "react-bootstrap/Container"
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row'
import 'react-widgets/dist/css/react-widgets.css';
import { Multiselect } from 'react-widgets'
import API from "../api/API"
import Table from "react-bootstrap/Table"
import Spinner from "react-bootstrap/Spinner"
import OptionalErrorMsg from './OptionalErrorMsg';
/**
 * Catalogo è il componente che gestisce il catalogo delle auto quando l'utente non è autenticato
 */
function Catalogo(){
    const [cars, setCars] = useState(null); //rappresenta tutte le aute ritornate dal server
    const [fetchError , setFetchError] = useState(false); //viene settato se avviene un errore durante la comunicazione con il server
    const [categories, setCategories] = useState(null); //rappresenta tutte le categorie ritornate dal server
    const [brands, setBrands] = useState(null); //rappresenta tutte le marche ritornate dal server
    const [loading, setLoading] = useState(3); //se diverso da zero il componente sta fetchando dati dal server
    const [catFilter, setCatFilter] = useState([]); //rappresenta le categoire selezionate dall'utente
    const [brandFilter, setBrandFilter] = useState([]); //rappresenta le marche selezionate dall'utente
    const [filteredCars,setFilteredCars] = useState(null); //rappresenta la lista delle auto filtrate dall'utente

    //UseEffect che preleva dal database la lista di tutte le auto del catalogo
    useEffect(()=>{
        API.getAllCars().then(
          (cars)=>{
            setCars(cars);
            setFilteredCars(cars);
            setLoading(l=>l-1)
          }
        ).catch((err)=>{
          setFetchError(true);
        })
        API.getAllCategories().then(
            (categories)=>{
              setCategories(categories);
              setLoading(l=>l-1)
            }
          ).catch((err)=>{
            setFetchError(true);
          })
          API.getAllBrands().then(
            (brands)=>{
              setBrands(brands);
              setLoading(l=>l-1)
            }
          ).catch((err)=>{
            setFetchError(true);
          })
          
    }, []);
    /**
     * setCategoriesFilter è una funzione che filtra le auto per categorie
     */
    const setCategoriesFilter = (categorie)=>{
      if (categorie.length===0){
        categorie=[];
        }
      let fCars = cars.filter((car)=>matchCar(car,categorie,brandFilter));
      setFilteredCars(fCars);
      setCatFilter(categorie);
    }
    /**
     * setBrandsFilter è una funzione che filtra le auto per marche
     */
    const setBrandsFilter = (marche)=>{
      if (marche.length===0){
        marche=[];
      }
      let fCars = cars.filter((car)=>matchCar(car,catFilter,marche));
      setFilteredCars(fCars);
      setBrandFilter(marche);
    }
    /**
     * matchCar riceve come parametro l'auto,la categoria e la marca e ritorna true o false a seconda se l'auto matchi con la categoria e la marca
     */
    const matchCar = (car,categorie,marche)=>{
      if (marche.length===0 && categorie.length===0)
        return true;
      if (marche.length===0)
        return categorie.includes(car.categoria);
      if (categorie.length===0)
        return marche.includes(car.marca);
      return categorie.includes(car.categoria) && marche.includes(car.marca);
    }
    //se è avvenuto un errore durante il caricamento dei dati
    if (fetchError)
      return <OptionalErrorMsg errorMsg="Impossibile contattare il server"/>
    //sennò visualizzo il catalogo
    return (<>
        <Container fluid>
            <Row>
            <Col sm="4">
            {loading===0 && <Sidebar categories={categories} brands={brands} activeFilters={{catFilter :catFilter,brandFilter :brandFilter}} setCatFilter= {setCategoriesFilter} setBrandsFilter={setBrandsFilter}/> }
            </Col>
            <Col sm="8">
            {loading===0 && <CarList cars={filteredCars}/>}
            {loading!==0 && <Spinner animation="grow" variant="warning"/>}
            </Col>
            </Row>
        </Container>
        </>
    );
}
/**
 * Sidebar è un componente che contiene i selettori per i filtri
 */
function Sidebar(props){
    return (
      <Container fluid id="sidebarCatalogo">
        
            <strong>FILTRI</strong>
            <br></br>
            <small>Categoria</small>
            <Multiselect
                data={props.categories}
                defaultValue={props.activeFilters.catFilter}
                onChange = {(value) => props.setCatFilter(value)}
            />
            
            <small>Marca</small>
            <Multiselect
                data={props.brands}
                defaultValue={props.activeFilters.brandFilter}
                onChange = {(value) => props.setBrandsFilter(value)}
            />
            <br></br>
        </Container>
    )
}
/**
 * CarList è un componente che visualizza la lista di auto filtrate
 */
function CarList(props){
    return (
        
        <Table>
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Marca</th>
                    <th>Modello</th>
                </tr>
            </thead>
            <tbody>
            {props.cars.map((car) => <CarItem key={car.id} car={car} />)}
            </tbody>
        </Table>
    )
      
}
/**
 * CarItem è un componente che visualizza le caratteristiche dell'auto
 */
function CarItem(props){
    return (
        <tr>
            <td>{props.car.categoria}</td>
            <td>{props.car.marca}</td>
            <td>{props.car.modello}</td>
        </tr>
    )
}
export default Catalogo;