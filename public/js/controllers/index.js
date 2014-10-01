'use strict';

angular.module('mean').controller('IndexController', [
    '$scope',
    '$rootScope',
    '$http',
    function ($scope, $rootScope, $http) {
        if (!$scope.blogs) {
            $http({method: 'GET', url: '/api/blogs'})
                .success(function(data) {
                    $scope.blogs = data;
                })
                .error(function(data) {
                    console.log(data);
                });
        }

        var unbind = $rootScope.$on('blog:create', function(evt, blog) {
            $scope.blogs = $scope.blogs || [];
            $scope.blogs.push(blog);
        });

        $scope.$on('$destroy', unbind);
    }
]);
