// Angular App Module
var app = angular.module('inventoryApp', []);

// Custom filter to handle null/undefined values
app.filter('safeFilter', function() {
    return function(items, filters) {
        if (!items || !filters) return items;

        return items.filter(function(item) {
            // Check each filter
            for (var key in filters) {
                if (!filters[key]) continue; // Skip empty filters

                var filterValue = filters[key].toString().toLowerCase();
                var itemValue = item[key];

                // Handle null/undefined
                if (itemValue === null || itemValue === undefined) {
                    return false;
                }

                // Convert to string and compare
                if (itemValue.toString().toLowerCase().indexOf(filterValue) === -1) {
                    return false;
                }
            }
            return true;
        });
    };
});

// Main Controller
app.controller('InventoryController', function($scope, $http) {

    // Initialize variables
    $scope.tasks = [];
    $scope.newTask = {};
    $scope.isEditing = false;
    $scope.filters = {
        Marca: '',
        Modelo: '',
        Tipo: '',
        Version: ''
    };
    $scope.alertMessage = '';
    $scope.alertType = 'success';

    // Lista de marcas disponibles
    $scope.marcas = [
        'AKT',
        'Bajaj',
        'Benelli',
        'BMW',
        'Ducati',
        'Hero',
        'Honda',
        'Kawasaki',
        'KTM',
        'Kymco',
        'Royal Enfield',
        'Suzuki',
        'Triumph',
        'TVS',
        'Yamaha',
        'Otros'
    ];

    // Versiones disponibles por marca
    $scope.versionesPorMarca = {
        'AKT': ['NKD 125', 'CR4 125', 'CR4 200 pro', '250R', 'Dynamic', 'TT 200'],
        'Bajaj': ['Boxer 100', 'Boxer 150', 'Discovery 125', 'Discovery 150', 'Pulsar 150', 'Pulsar 200', 'Dominar 250', 'Dominar 400'],
        'Benelli': ['Leoncino 250', 'Leoncino 500', 'Leonciono Trail', 'Leoncino 800', 'TRK 251', 'TRK 502', 'TRK502x', 'TNT 135', 'Tornado'],
        'BMW': ['G1200', 'F800', 'G310', 'M1000', 'S1000'],
        'Ducati': ['Hypermotard', 'Panigale V2s', 'Scrambler', 'Multiestrada', 'XDiavel'],
        'Hero': ['Hunk 160R', 'Hunk 125R', 'Xpulse', 'Xpulse 200', 'Eco 100'],
        'Honda': ['CB190R', 'CB100', 'CB125F', 'XR150', 'Wave S'],
        'Kawasaki': ['Ninja 400', 'ZX-10R', 'Versys 300', 'Versys 1000', 'Z900'],
        'KTM': ['Duke 125', 'Duke 250', 'Duke390', 'RC390', 'SMR 690'],
        'Kymco': ['Agility', 'Agility Fusion', 'Twist', 'Black'],
        'Royal Enfield': ['Himalaya 450', 'Classic 350', 'mETEOR 350', 'HNTR 350'],
        'Suzuki': ['AX4', 'GN125', 'Vstrom 160', 'Vstrom 250', 'GSX-8R'],
        'Triumph': ['Boneville T100', 'Spedd 400', 'Scramber 400x', 'Speed Twin 900', 'Rocket 3'],
        'TVS': ['Apache 160', 'Apache RTR', 'NTorque', 'Raider', 'King'],
        'Yamaha': ['Crypton', 'MT07', 'MT09', 'R15', 'XTZ 250', 'Tenere'],
        'Otros': ['Otros']
    };

    // Obtener versiones disponibles según la marca seleccionada
    $scope.getVersiones = function() {
        if ($scope.newTask.Marca && $scope.versionesPorMarca[$scope.newTask.Marca]) {
            return $scope.versionesPorMarca[$scope.newTask.Marca];
        }
        return [];
    };

    // Limpiar versión cuando cambie la marca
    $scope.onMarcaChange = function() {
        $scope.newTask.Version = '';
    };

    // Lista de tipos de repuestos
    $scope.tipos = [
        'Acelerador (maneta derecha)',
        'Aceite (motor, transmisión)',
        'Amortiguador de dirección',
        'Amortiguadores (delanteros y traseros)',
        'Árbol de levas',
        'Arandela de piñón',
        'Banda de frenos',
        'Banda de motor',
        'Banda de transmisión (correa)',
        'Base acelerador',
        'Base de maleta',
        'Base del manillar',
        'Bastidor (chasis)',
        'Bastones (horquillas)',
        'Batería',
        'Bielas',
        'Bobina de encendido',
        'Bocina/Claxon',
        'Bomba de combustible',
        'Bomba de freno',
        'Bomba de aceite',
        'Bujías',
        'Cable de embrague',
        'Cable de acelerador',
        'Caballete (pata de cabra)',
        'Cadena de transmisión',
        'Caliper de freno',
        'Carburador',
        'Carenado',
        'Carter',
        'Centralita (ECU)',
        'Cigüeñal',
        'Cilindro',
        'Cinta de llanta',
        'Cinta de freno',
        'Cinta de llanta (rin)',
        'Circuito de refrigeración',
        'Cúpula',
        'Disco de freno',
        'Eje de ruedas',
        'Embrague',
        'Encendido',
        'Estriberas (pedales)',
        'Escape (tubo de escape)',
        'Faros (delantero y trasero)',
        'Filtro de aire',
        'Filtro de aceite',
        'Filtro de combustible',
        'Flash de luces',
        'Guardabarros',
        'Herramientas',
        'Horquilla',
        'Intermitentes (luces direccionales)',
        'Kit de arrastre',
        'Llantas',
        'Luces (delanteras, traseras e intermitentes)',
        'Manillar',
        'Maneta de freno',
        'Maneta de embrague',
        'Maleta',
        'Mando de luces',
        'Manguera de combustible',
        'Motor',
        'Neumáticos',
        'Panel de instrumentos (cuadro)'
    ];

    // API Base URL
    var apiUrl = '/api';

    // Calcular el próximo ID disponible
    $scope.calcularProximoId = function() {
        if ($scope.tasks.length === 0) {
            return 1;
        }
        var maxId = Math.max.apply(Math, $scope.tasks.map(function(task) {
            return task.TaskId;
        }));
        return maxId + 1;
    };

    // Load all tasks on init
    $scope.loadTasks = function() {
        $http.get(apiUrl + '/all-tasks')
            .then(function(response) {
                $scope.tasks = response.data;
                console.log('Tasks loaded:', $scope.tasks.length);

                // Asignar el próximo ID automáticamente si estamos creando
                if (!$scope.isEditing) {
                    $scope.newTask.TaskId = $scope.calcularProximoId();
                }
            })
            .catch(function(error) {
                console.error('Error loading tasks:', error);
                $scope.showAlert('Error al cargar los repuestos', 'danger');
            });
    };

    // Create new task
    $scope.createTask = function() {
        // Validate required fields
        if (!$scope.newTask.TaskId || !$scope.newTask.Marca || !$scope.newTask.Modelo ||
            !$scope.newTask.Tipo || $scope.newTask.Cantidad === undefined || !$scope.newTask.Version) {
            $scope.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        // Check if TaskId already exists
        var existingTask = $scope.tasks.find(function(task) {
            return task.TaskId === $scope.newTask.TaskId;
        });

        if (existingTask) {
            $scope.showAlert('Ya existe un repuesto con ese ID', 'warning');
            return;
        }

        // Create task object
        var taskData = {
            TaskId: parseInt($scope.newTask.TaskId),
            Marca: $scope.newTask.Marca,
            Modelo: parseInt($scope.newTask.Modelo),
            Tipo: $scope.newTask.Tipo,
            Cantidad: parseInt($scope.newTask.Cantidad),
            Version: $scope.newTask.Version
        };

        $http.post(apiUrl + '/create-task', taskData)
            .then(function(response) {
                console.log('Task created:', response.data);
                $scope.showAlert('Repuesto agregado exitosamente', 'success');
                $scope.loadTasks();
                $scope.resetForm();
            })
            .catch(function(error) {
                console.error('Error creating task:', error);
                $scope.showAlert('Error al agregar el repuesto', 'danger');
            });
    };

    // Edit task - populate form
    $scope.editTask = function(task) {
        $scope.isEditing = true;
        $scope.newTask = {
            TaskId: task.TaskId,
            Marca: task.Marca,
            Modelo: task.Modelo,
            Tipo: task.Tipo,
            Cantidad: task.Cantidad,
            Version: task.Version
        };

        // Scroll to top to show form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Update task
    $scope.updateTask = function() {
        // Validate required fields
        if (!$scope.newTask.TaskId || !$scope.newTask.Marca || !$scope.newTask.Modelo ||
            !$scope.newTask.Tipo || $scope.newTask.Cantidad === undefined || !$scope.newTask.Version) {
            $scope.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        var taskData = {
            TaskId: parseInt($scope.newTask.TaskId),
            Marca: $scope.newTask.Marca,
            Modelo: parseInt($scope.newTask.Modelo),
            Tipo: $scope.newTask.Tipo,
            Cantidad: parseInt($scope.newTask.Cantidad),
            Version: $scope.newTask.Version
        };

        $http.post(apiUrl + '/update-task', taskData)
            .then(function(response) {
                console.log('Task updated:', response.data);
                $scope.showAlert('Repuesto actualizado exitosamente', 'success');
                $scope.loadTasks();
                $scope.resetForm();
            })
            .catch(function(error) {
                console.error('Error updating task:', error);
                $scope.showAlert('Error al actualizar el repuesto', 'danger');
            });
    };

    // Delete task
    $scope.deleteTask = function(taskId) {
        if (!confirm('¿Está seguro que desea eliminar este repuesto?')) {
            return;
        }

        $http.delete(apiUrl + '/delete-task', {
            data: { TaskId: taskId },
            headers: { 'Content-Type': 'application/json' }
        })
        .then(function(response) {
            console.log('Task deleted:', response.data);
            $scope.showAlert('Repuesto eliminado exitosamente', 'success');
            $scope.loadTasks();
        })
        .catch(function(error) {
            console.error('Error deleting task:', error);
            $scope.showAlert('Error al eliminar el repuesto', 'danger');
        });
    };

    // Cancel edit mode
    $scope.cancelEdit = function() {
        $scope.resetForm();
    };

    // Reset form
    $scope.resetForm = function() {
        $scope.newTask = {};
        $scope.isEditing = false;
        // Asignar el próximo ID automáticamente
        $scope.newTask.TaskId = $scope.calcularProximoId();
    };

    // Clear all filters
    $scope.clearFilters = function() {
        $scope.filters = {
            Marca: '',
            Modelo: '',
            Tipo: '',
            Version: ''
        };
    };

    // Show alert message
    $scope.showAlert = function(message, type) {
        $scope.alertMessage = message;
        $scope.alertType = type || 'success';

        // Auto-hide after 5 seconds
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.closeAlert();
            });
        }, 5000);
    };

    // Close alert
    $scope.closeAlert = function() {
        $scope.alertMessage = '';
    };

    // Load tasks on controller initialization
    $scope.loadTasks();
});
