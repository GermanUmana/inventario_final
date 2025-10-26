var mongoose = require("mongoose");
var express = require("express");
var TaskModel = require('./task_schema');
var router = express.Router();

let environment = null;

if (!process.env.ON_RENDER) {
    console.log("Cargando variables de entorno desde archivo");
    const env = require('node-env-file');
    env(__dirname + '/.env');
}

environment = {
    DBMONGOUSER: process.env.DBMONGOUSER,
    DBMONGOPASS: process.env.DBMONGOPASS,
    DBMONGOSERV: process.env.DBMONGOSERV,
    DBMONGO: process.env.DBMONGO,
};

var query = 'mongodb+srv://' + environment.DBMONGOUSER + ':' + environment.DBMONGOPASS + '@' + environment.DBMONGOSERV + '/' + environment.DBMONGO + '?retryWrites=true&w=majority&appName=Cluster0';


var query = "mongodb+srv://user:1234@cluster0.yqg7blw.mongodb.net/taskBD?retryWrites=true&w=majority&appName=Cluster0"
const db = (query);

mongoose.Promise = global.Promise;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión a la base de datos exitosa');
}).catch((err) => {
    console.error('Error al conectar a la base de datos', err);
});

router.post('/create-task', function (req, res) {
    let task_id = req.body.TaskId;
    let marca=req.body.Marca;
    let modelo=req.body.Modelo;
    let tipo=req.body.Tipo;
    let cantidad=req.body.Cantidad;
    let version=req.body.Version;


    let task = {
        TaskId: task_id,
        Marca:marca,
        Version:version,
        Modelo:modelo,
        Tipo:tipo,
        Cantidad:cantidad
    }

    var newTask = new TaskModel(task);

    newTask.save()
        .then(data => {
            res.status(200).send("OK\n");
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal error\n");
        });
});

router.get('/all-tasks', function (req, res) {
    TaskModel.find()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal error\n");
        });
});

router.post('/update-task', function (req, res) {
    TaskModel.updateOne(
        { TaskId: req.body.TaskId }, 
        {
            Marca:req.body.Marca,
            Version:req.body.Version,
            Modelo:req.body.Modelo,
            Tipo:req.body.Tipo,
            Cantidad:req.body.Cantidad
        }
    )
        .then(data => {
            res.status(200).send("OK\n");
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal error\n");
        });
});

router.delete('/delete-task', function (req, res) {
    TaskModel.deleteOne({ TaskId: req.body.TaskId })
        .then(data => {
            res.status(200).send("OK\n");
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal error\n");
        });
});

module.exports = router;