import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import Dropzone from './../../components/Dropzone';

import './styles.css';
import logo from './../../assets/logo.svg';
import { FiArrowLeft } from 'react-icons/fi';

import apiItems from './../../services/apiItems';
import apiUfs from './../../services/apiUfs';
import axios from 'axios';

interface Item{
     id: number,
     name: string,
     image_url: string,
}

interface States{
     nome: string,
     sigla: string,
}

interface Cities{
     nome: string,
}

const CreatePoint = () => {

     const [items, setItems] = useState<Item[]>([]);
     const [ufs, setUfs] = useState<States[]>([]);
     const [cities, setCities] = useState<string[]>([]);
     const [selectedUf, setSelectedUf] = useState('Selecione um estado');
     const [selectedCity, setSelectedCity] = useState('Selecione uma cidade');
     const [selectedItems, setSelectedItems] = useState<number[]>([])
     const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
     const [selectedMapClick, setSelectedClickMap] = useState<[number, number]>([0,0]);
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          whatsapp: '',
     });

     const history = useHistory();

     function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
          const uf = event.target.value;
          setSelectedUf(uf);
     }
     
     function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
          const city = event.target.value;
          setSelectedCity(city);
     }

     function handleSelectedMapClick(event: LeafletMouseEvent){
          setSelectedClickMap([
               event.latlng.lat,
               event.latlng.lng,
          ]);
     }

     function handleInputChange(event: ChangeEvent<HTMLInputElement>){
          const {name, value} = event.target;
          setFormData({...formData, [name]: value});
     }

     function handleSelectItem(id: number){
          const alreadySelected = selectedItems.findIndex(item => item === id);
          if(alreadySelected >= 0){
               const filteredItems = selectedItems.filter(item => item !== id);
               setSelectedItems(filteredItems);
          } else {
               setSelectedItems([...selectedItems, id]);
          }
     }

     async function handleSubmit(event: FormEvent){
          event.preventDefault();
          const { name, email, whatsapp } = formData;
          const uf = selectedUf;
          const city = selectedCity;
          const [latitude, longitude] = selectedMapClick;
          const items = selectedItems;

          const data = {
               name,
               city,
               uf,
               email,
               whatsapp,
               latitude,
               longitude,
               items,
          }

          console.log(data);

          await apiItems.post('points', data);
          alert("Posto de coleta criado!");
          history.push("/");
     }

     useEffect(() => {
          navigator.geolocation.getCurrentPosition(position => {
               const {latitude, longitude} = position.coords;
               setInitialPosition([latitude, longitude]);
          })
     }, [])

     useEffect(() => {
          apiItems.get('items').then(response => {
               setItems(response.data)
          })
     }, []);

     useEffect(() => {
          apiUfs.get('').then(response => {
               setUfs(response.data);
          })
     }, []);

     useEffect(() => {
          if(selectedUf === 'Selecione um estado'){
               return;
          }
          axios.get<Cities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
               const cityNames = response.data.map(city => city.nome);
               setCities(cityNames)
          })
     }, [selectedUf])

     return (
          <div id="page-create-point">
               <header>
                    <img src={logo} alt="Ecoleta"/>
                    <Link to="/">
                         <FiArrowLeft/>
                         Voltar para home
                    </Link>
               </header>
               <form onSubmit={handleSubmit}>
                    <h1>
                         Cadastro do<br/> ponto de coleta
                    </h1>

                    <Dropzone/>

                    <fieldset>
                         <legend>
                              <h2>Dados</h2>
                         </legend>
                         <div className="field">
                              <label htmlFor="name">Nome da entidade</label>
                              <input type="text" name="name" id="name" onChange={handleInputChange}/>
                         </div>
                         <div className="field-group">
                              <div className="field">
                                   <label htmlFor="email">Email</label>
                                   <input type="email" name="email" id="email" onChange={handleInputChange}/>
                              </div>
                              <div className="field">
                                   <label htmlFor="whatsapp">Whatsapp</label>
                                   <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                              </div>
                         </div>          
                    </fieldset>
                    <fieldset>
                         <legend>
                              <h2>Endereço</h2>
                              <span>Selecione um ou mais endereços no mapa</span>
                         </legend>

                         <Map center={initialPosition} zoom={15} onClick={handleSelectedMapClick}>
                              <TileLayer
                                   attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={selectedMapClick} />
                         </Map>

                         <div className="field-group">
                              <div className="field">
                                   <label htmlFor="uf">Estado (UF)</label>
                                   <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                                        <option selected disabled>Selecione um estado</option>
                                        {ufs.map(item => {
                                             return(
                                                  <option key={item.sigla} value={item.sigla}>{item.nome}</option>
                                             )
                                        })}
                                   </select>
                              </div>
                              <div className="field">
                                   <label htmlFor="city">Cidade</label>
                                   <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                        <option selected disabled>Selecione uma cidade</option>
                                        {cities.map(item => {
                                             return(
                                                  <option key={item} value={item}>{item}</option>
                                             )
                                        })}
                                   </select>
                              </div>
                         </div>    
                    </fieldset>
                    <fieldset>
                         <legend>
                              <h2>Items de coleta</h2>
                              <span>Selecione um ou mais endereços no mapa</span>
                         </legend>     
                         <ul className="items-grid">
                              {items.map(item => {
                                   return(
                                        <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                             <img src={item.image_url} alt={item.name}/>
                                             <span>{item.name}</span>
                                        </li>
                                   )
                              })}
                         </ul>              
                    </fieldset>
                    <button type="submit">Cadastrar ponto de coleta</button>
               </form>
          </div>
     );
}

export default CreatePoint;