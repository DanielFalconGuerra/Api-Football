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
    var edicion = request.params.edicion;
    var equipo = request.params.equipo;
    connection.query(`select idjug.IdPertenecio, idjug.Dorsal, j.Nombre, po.Nombre as Posicion, po.Abreviacion from (
                        select p.* from (select e.IdEquipo from equipo e where e.Nombre = '${equipo}') eq
                        join pertenecio p on p.IdEquipo = eq.IdEquipo
                        join (select ed.IdEdicion from edicion ed where ed.Edicion = '${edicion}') ed
                        on ed.IdEdicion = p.IdEdicion) idjug
                        join jugador j on j.IdJugador = idjug.IdJugador
                        join posicion po on po.IdPosicion = idjug.IdPosicion`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

const getTeamChampionships = (request, response) => {
    var equipo = request.params.equipo;
    connection.query(`select c.IdCampeonato, t.Nombre, count(t.IdTitulo) as Cantidad from (
                        select e.IdEquipo from equipo e where e.Nombre = '${equipo}')equipo
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
app.route("/equipo/titulos/:equipo").get(getTeamChampionships);
app.route("/equipo/jugadores/:equipo/:edicion").get(GetPlayersByTeam);


module.exports = app;

