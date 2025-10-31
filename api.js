var mongoose = require("mongoose");
var express = require("express");
var TaskModel = require('./task_schema');
var UserModel = require('./user_schema');
var router = express.Router();

// Store sessions in memory (for development - use express-session/Redis in production)
const sessions = {};

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


// Use environment variables for database connection
const db = query;

mongoose.Promise = global.Promise;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión a la base de datos exitosa');
}).catch((err) => {
    console.error('Error al conectar a la base de datos', err);
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'No autorizado. Token requerido.' });
    }

    const session = sessions[token];
    if (!session) {
        return res.status(401).json({ message: 'Sesión inválida o expirada.' });
    }

    req.user = session.user;
    next();
}

// Middleware to check if user is Administrator
function isAdmin(req, res, next) {
    if (req.user.role !== 'Administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
    next();
}

// Generate simple token (use JWT in production)
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Register new user
router.post('/register', function (req, res) {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    // Check if user already exists
    UserModel.findOne({ username: username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ message: 'El usuario ya existe.' });
            }

            // Create new user (in production, hash the password with bcrypt)
            const newUser = new UserModel({
                username: username,
                password: password, // TODO: Hash password with bcrypt
                role: role || 'User'
            });

            return newUser.save();
        })
        .then(user => {
            res.status(201).json({
                message: 'Usuario registrado exitosamente.',
                user: {
                    username: user.username,
                    role: user.role
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error al registrar usuario.' });
        });
});

// Login
router.post('/login', function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    UserModel.findOne({ username: username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // In production, use bcrypt.compare(password, user.password)
            if (user.password !== password) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // Create session
            const token = generateToken();
            sessions[token] = {
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                },
                createdAt: Date.now()
            };

            res.status(200).json({
                message: 'Login exitoso.',
                token: token,
                user: {
                    username: user.username,
                    role: user.role
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error al iniciar sesión.' });
        });
});

// Logout
router.post('/logout', function (req, res) {
    const token = req.headers['authorization'];

    if (token && sessions[token]) {
        delete sessions[token];
    }

    res.status(200).json({ message: 'Logout exitoso.' });
});

// Get current user
router.get('/current-user', isAuthenticated, function (req, res) {
    res.status(200).json({ user: req.user });
});

// ============================================
// TASK ENDPOINTS (Protected)
// ============================================

// Create task (Admin only)
router.post('/create-task', isAuthenticated, isAdmin, function (req, res) {
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

// Get all tasks (Authenticated users)
router.get('/all-tasks', isAuthenticated, function (req, res) {
    TaskModel.find()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal error\n");
        });
});

// Update task (Admin: all fields, User: only Cantidad)
router.post('/update-task', isAuthenticated, function (req, res) {
    let updateData = {};

    // If user is Admin, allow updating all fields
    if (req.user.role === 'Administrador') {
        updateData = {
            Marca: req.body.Marca,
            Version: req.body.Version,
            Modelo: req.body.Modelo,
            Tipo: req.body.Tipo,
            Cantidad: req.body.Cantidad
        };
    } else {
        // If user is regular User, only allow updating Cantidad
        updateData = {
            Cantidad: req.body.Cantidad
        };
    }

    TaskModel.updateOne(
        { TaskId: req.body.TaskId },
        updateData
    )
        .then(data => {
            res.status(200).json({
                message: "Repuesto actualizado exitosamente",
                updatedFields: req.user.role === 'Administrador' ? 'todos los campos' : 'solo cantidad'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Error al actualizar repuesto" });
        });
});

// Delete task (Admin only)
router.delete('/delete-task', isAuthenticated, isAdmin, function (req, res) {
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