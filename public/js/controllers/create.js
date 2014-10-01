'use strict';

angular.module('mean').controller('CreateController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    '$upload',
    function($scope, $rootScope, $http, $state, $stateParams, $upload) {
        $scope.createBlog = function() {
            if (!$scope.blogTitle) {
                $scope.invalid = true;
                return;
            }

            $scope.invalid = false;
            $http({
                method: 'POST',
                url: '/api/blogs',
                data: {
                    title: $scope.blogTitle
                }
            }).success(function(blog) {
                $rootScope.$emit('blog:create', blog);
                $state.go('blogs');
            }).error(function(data) {
                console.log(data);
            });
        };
        $scope.createBlogPost = function() {
            var id = $stateParams.id;
            if (!$scope.postTitle || $scope.postBody.length > 160) {
                $scope.invalid = true;
                return;
            }

            if ($scope.image) {
                $scope.upload = $upload.upload({
                    url: '/api/blogs/' + id + '/posts',
                    method: 'POST',
                    data: {
                        title: $scope.postTitle,
                        body: $scope.postBody
                    },
                    file: $scope.image
                }).success(function(post) {
                    $state.go('blogs.posts.detail', {
                        postId: post._id
                    });
                }).error(function(data) {
                    console.log('Error uploading file: ' + data);
                    $scope.invalid = true;
                });
            } else {
                $http({
                    method: 'POST',
                    url: '/api/blogs/' + id + '/posts',
                    data: {
                        title: $scope.postTitle,
                        body: $scope.postBody
                    }
                }).success(function(post) {
                    $state.go('blogs.posts.detail', {
                        postId: post._id
                    });
                }).error(function(data) {
                    console.log(data);
                    $scope.invalid = true;
                });
            }
        };
        $scope.onFileSelect = function(image) {
            if (_.isArray(image)) {
                image = image[0];
            }

            switch (image.type) {
                case 'image/png':
                case 'image/jpeg':
                case 'image/gif':
                    break;
                default:
                    console.log('Only PNG/JPEG/GIF are accepted.');
                    return;
            }

            // Preview the image as data:URL
            var reader = new FileReader();
            reader.onloadend = function() {
                var src = reader.result;
                $scope.$apply(function() {
                    $scope.imageSrc = src;
                });
            };
            reader.readAsDataURL(image);
            $scope.image = image;
        };
    }
]);
