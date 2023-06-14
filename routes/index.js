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
    var IdLiga = request.params.idliga;
    connection.query(`select eq.IdEquipo, eq.Nombre, eq.Fundacion, eq.Escudo, es.Nombre as Estadio from (select * from equipo e where IdLiga = ${IdLiga} ) eq
                        join estadio es on es.IdEstadio = eq.IdEstadio`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

const GetPlayersByTeam = (request, response) => {
    var IdEquipo = request.params.idequipo;
    connection.query(`select j.IdJugador, j.Nombre, j.Edad, j.Dorsal, p.Nombre as Pais, pos.Abreviacion, pos.Nombre as Posicion  from (select * from jugador where IdEquipo = ${IdEquipo})j
                                            join pais p on p.IdPais = j.IdPais 
                                            join posicion pos on pos.IdPosicion = j.IdPosicion`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

const GetTeamChampionships = (request, response) => {
    var IdEquipo = request.params.idequipo;
    connection.query(`select c.IdCampeonato, t.Nombre, c.cantidad from (select * from campeonato where IdEquipo = ${IdEquipo}) c 
                        join titulo t on t.IdTitulo = c.IdTitulo`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

//ruta
app.route("/ligas").get(getLiga);
app.route("/jugadores/:idequipo").get(GetPlayersByTeam);
app.route("/equipos/:idliga").get(getEquipos);
app.route("/equipos/titulos/:idequipo").get(GetTeamChampionships);


module.exports = app;

