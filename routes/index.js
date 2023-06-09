const express = require("express");
const app = express();
const path = require('path');

const dotenv = require("dotenv");
dotenv.config();

//conexión con la base de datos
const {connection} = require("../database/config.db");

//index.js
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '..', 'public')});
  })

const getLiga = (request, response) => {
    connection.query("SELECT * FROM ligas", 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

const getEquipos = (request, response) => {
    connection.query(`select eq.IdEquipo, eq.Nombre, eq.Fundacion, eq.Escudo, es.Nombre as Estadio from (select * from equipo e where IdLiga = 1 ) eq
                        join estadio es on es.IdEstadio = eq.IdEstadio`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

//ruta
app.route("/ligas").get(getLiga);
app.route("/equipos").get(getEquipos);


module.exports = app;

