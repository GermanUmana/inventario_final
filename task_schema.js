var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    TaskId: Number,
    Name: String,
    Deadline: Date,
    Marca:String,
    Modelo:Number,
    Tipo:String,
    Cantidad:Number,
    Version:String
});

module.exports = mongoose.model(
    'task', TaskSchema, 'Tasks');