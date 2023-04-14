const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

//conexión con la base de datos
const {connection} = require("../database/config.db");

const getLiga = (request, response) => {
    connection.query("SELECT * FROM ligas", 
    (error, results) => {
        if(error)
            throw error;
        response.status(200).json(results);
    });
};

//ruta
app.route("/ligas")
.get(getLiga);


module.exports = app;