// Angular App Module
var app = angular.module('inventoryApp', []);

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

    // API Base URL
    var apiUrl = '/api';

    // Load all tasks on init
    $scope.loadTasks = function() {
        $http.get(apiUrl + '/all-tasks')
            .then(function(response) {
                $scope.tasks = response.data;
                console.log('Tasks loaded:', $scope.tasks.length);
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
