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

const getStandingsByLigue = (request, response) => {
    var edicion = request.params.edicion;
    var liga = request.params.liga;
    connection.query(`select d.*, eq.Nombre from (select t.* from (select e.IdEdicion from edicion e where e.Edicion = '${edicion}')ed
                        join Torneo t on t.IdEdicion = ed.IdEdicion)tor
                        join (select * from ligas l where l.Nombre = '${liga}') li
                        on li.IdLiga = tor.IdLiga
                        join disputo d ON d.IdTorneo = tor.idTorneo
                        join equipo eq on eq.IdEquipo = d.IdEquipo
                        order by d.Posicion`, 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

const getStatisticsByLeague = (request, response) => {
    var edicion = request.params.edicion;
    var liga = request.params.liga;
    var accion = request.params.accion;
    connection.query(`select est.IdEstadisticas, est.Cantidad, est.Posicion, j.IdJugador, j.Nombre, po.Nombre as Posicion, po.Abreviacion, eq.Nombre as Equipo from (select e.IdEdicion from edicion e where e.Edicion = '${edicion}') ed
                        join Torneo t on t.IdEdicion = ed.IdEdicion
                        join (select * from ligas l where l.Nombre = '${liga}') li
                        on li.IdLiga = t.IdLiga
                        join (select es.* from (select ae.IdAccion from acciones_estadisticas ae where ae.Nombre = '${accion}') aces join estadisticas es on es.IdAccion = aces.IdAccion) est
                        on t.IdTorneo = est.IdTorneo
                        join pertenecio p on p.IdPertenecio = est.IdPertenecio 
                        join jugador j on j.IdJugador = p.IdJugador 
                        join equipo eq on eq.IdEquipo = p.IdEquipo 
                        join posicion po on po.IdPosicion = p.IdPosicion
                        order by est.Posicion asc`, 
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
app.route("/liga/:liga/posiciones/:edicion").get(getStandingsByLigue);
app.route("/liga/estadisticas/:liga/:edicion/:accion").get(getStatisticsByLeague);



module.exports = app;

