var app = angular.module("studentApp", []);

app.controller("MainController", function($scope) {

    // Hello world default
    $scope.name = "";

    // Student list
    $scope.students = [];

    // Add student
    $scope.addStudent = function() {

        if ($scope.student && $scope.student.name) {
            $scope.students.push({
                name: $scope.student.name,
                age: $scope.student.age,
                course: $scope.student.course
            });

            // Clear form
            $scope.student = {};
        }
    };

    // Delete student
    $scope.deleteStudent = function(index) {
        $scope.students.splice(index, 1);
    };

});