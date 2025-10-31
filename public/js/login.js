// Login App Module
var app = angular.module('loginApp', []);

// Login Controller
app.controller('LoginController', function($scope, $http, $window) {

    // Initialize variables
    $scope.activeTab = 'login';
    $scope.showPassword = false;
    $scope.loading = false;
    $scope.alertMessage = '';
    $scope.alertType = 'success';

    $scope.loginData = {
        username: '',
        password: ''
    };

    $scope.registerData = {
        username: '',
        password: '',
        role: ''
    };

    // API Base URL
    var apiUrl = '/api';

    // Set active tab
    $scope.setTab = function(tab) {
        $scope.activeTab = tab;
        $scope.closeAlert();
        $scope.showPassword = false;
    };

    // Toggle password visibility
    $scope.togglePassword = function() {
        $scope.showPassword = !$scope.showPassword;
    };

    // Login function
    $scope.login = function() {
        if (!$scope.loginData.username || !$scope.loginData.password) {
            $scope.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        $scope.loading = true;

        $http.post(apiUrl + '/login', $scope.loginData)
            .then(function(response) {
                console.log('Login successful:', response.data);

                // Store token and user data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                $scope.showAlert('¡Bienvenido ' + response.data.user.username + '!', 'success');

                // Redirect to main app after 1 second
                setTimeout(function() {
                    $window.location.href = '/';
                }, 1000);
            })
            .catch(function(error) {
                console.error('Login error:', error);
                $scope.loading = false;

                var errorMessage = 'Error al iniciar sesión';
                if (error.data && error.data.message) {
                    errorMessage = error.data.message;
                }

                $scope.showAlert(errorMessage, 'danger');
            });
    };

    // Register function
    $scope.register = function() {
        if (!$scope.registerData.username || !$scope.registerData.password || !$scope.registerData.role) {
            $scope.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        $scope.loading = true;

        $http.post(apiUrl + '/register', $scope.registerData)
            .then(function(response) {
                console.log('Registration successful:', response.data);
                $scope.loading = false;

                $scope.showAlert('Usuario registrado exitosamente. Ahora puede iniciar sesión.', 'success');

                // Clear form
                $scope.registerData = {
                    username: '',
                    password: '',
                    role: ''
                };

                // Switch to login tab after 2 seconds
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.setTab('login');
                    });
                }, 2000);
            })
            .catch(function(error) {
                console.error('Registration error:', error);
                $scope.loading = false;

                var errorMessage = 'Error al registrar usuario';
                if (error.data && error.data.message) {
                    errorMessage = error.data.message;
                }

                $scope.showAlert(errorMessage, 'danger');
            });
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

    // Check if user is already logged in
    var token = localStorage.getItem('token');
    if (token) {
        // Verify token is still valid
        $http.get(apiUrl + '/current-user', {
            headers: { 'Authorization': token }
        })
        .then(function(response) {
            // Token is valid, redirect to main app
            $window.location.href = '/';
        })
        .catch(function(error) {
            // Token is invalid, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }
});
