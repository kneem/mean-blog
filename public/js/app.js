'use strict';

var meanApp = angular.module('mean', [
    'ngCookies',
    'ngResource',
    'ui.bootstrap',
    'ui.router',
    'angularFileUpload'
]);

meanApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('blogs', {
            url: '/',
            views: {
                'sidebar': {
                    templateUrl: '../views/sidebar.html',
                    controller: 'IndexController'
                },
                'main-content@': {
                    templateUrl: '../views/index.html'
                }
            }
        })
        .state('blogs.create', {
            url: 'blogs/create/',
            views: {
                'main-content@': {
                    templateUrl: '../views/blogs.create.html',
                    controller: 'CreateController'
                }
            }
        })
        .state('blogs.posts', {
            url: 'blogs/:id/',
            views: {
                'main-content@': {
                    templateUrl: '../views/posts.html',
                    controller: function($scope, $stateParams, $http) {
                        $http({method: 'GET', url: '/api/blogs/' + $stateParams.id})
                            .success(function(data) {
                                $scope.posts = data.posts;
                            })
                            .error(function(data) {
                                console.log(data);
                            });

                        $scope.deletePost = function(postId) {
                            $http({method: 'DELETE', url: '/api/blogs/' + $stateParams.id + '/posts/' + postId})
                                .success(function(data) {
                                    $scope.posts = data.posts;
                                })
                                .error(function(data) {
                                    console.log(data);
                                });
                        };
                    }
                }
            }
        })
        .state('blogs.posts.create', {
            url: 'posts/create/',
            views: {
                'main-content@': {
                    templateUrl: '../views/posts.create.html',
                    controller: 'CreateController'
                }
            }
        })
        .state('blogs.posts.detail', {
            url: 'posts/:postId',
            views: {
                'main-content@': {
                    templateUrl: '../views/posts.detail.html',
                    controller: function($scope, $stateParams, $http) {
                        $http({method: 'GET', url: '/api/blogs/' + $stateParams.id + '/posts/' + $stateParams.postId})
                            .success(function(data) {
                                $scope.post = data;
                            })
                            .error(function(data) {
                                console.log(data);
                            });
                    }
                }
            }
        });
});

meanApp.run(function($rootScope, $state) {
    $rootScope.goBack = function() {
        var prevState = $rootScope.lastState && $rootScope.lastState.name,
            toParams = $rootScope.lastState && $rootScope.lastState.params,
            to = 'blogs';

        if (prevState) {
            to = prevState;
        }
        $state.go(to, toParams);
    };
    // Track what the last state was.
    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
       $rootScope.lastState = {
            name: from.name,
            params: fromParams
        };
    });
});
