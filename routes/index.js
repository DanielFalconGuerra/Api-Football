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
    var NombreLiga = request.params.nombreliga;
    var Edicion = request.params.edicion;
    connection.query(`select d.IdEquipo, d.Posicion, e.Nombre, es.Nombre as Estadio, es.Ubicacion from (
                        select * from (
                            select t.IdTorneo, t.IdLiga, l.Nombre from (
                                select IdEdicion from edicion where Edicion = '${Edicion}')edicion
                        join Torneo t on t.IdEdicion = edicion.IdEdicion 
                        join ligas l on l.IdLiga = t.IdLiga )liga
                        where liga.Nombre = '${NombreLiga}')torneo
                        join disputo d on d.IdTorneo = torneo.IdTorneo
                        join equipo e on e.IdEquipo = d.IdEquipo 
                        join estadio es on es.IdEstadio = e.IdEstadio`, 
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
    var Team = request.params.team;
    response.status(200).json('Team');
    connection.query(`select c.IdCampeonato, t.Nombre, count(t.IdTitulo) as Cantidad from (
                        select e.IdEquipo from equipo e where e.Nombre = '${Team}')equipo
                        join campeonato c on c.IdEquipo = equipo.IdEquipo
                        join titulo t on t.IdTitulo = c.IdTitulo
                        group by c.IdTitulo`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};


//ruta
app.route("/ligas").get(getLiga);
app.route("/equipos/:nombreliga/:edicion").get(getEquipos);
app.route("/equipos/titulos/:team").get(GetTeamChampionships);


module.exports = app;

