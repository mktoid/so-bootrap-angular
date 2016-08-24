'use strict';

var soApiKey = 'LFLwosuAarhs53AImoQzcQ(('; 

var so = angular.module('so', ['ngRoute', 'ngResource', 'ngSanitize', 'angularLazyImg', 'ngAnimate']);

so.config(
        ['$routeProvider',
        function($routeProvider) {
            $routeProvider
                    .when('/', {
                        templateUrl: 'templates/main.html',
                        controller: 'MainCtrl'
                    })
                    .when('/search/:query', {
                        templateUrl: 'templates/search.html',
                        controller: 'SearchCtrl'
                    })
                    .when('/question/:questionId/', {
                        templateUrl: 'templates/question.html',
                        controller: 'QuestionCtrl'
                    })
                    .otherwise('/')
                    ;
        }
    ]
    )
    
    .controller('MainCtrl', function($scope, $location) {
        $scope.search = function() {
            if ($scope.query) {
                $location.path('/search/' + $scope.query);
            } 
        };
    })
    
    .controller('QuestionCtrl', function($scope, $routeParams, $http) {
        
        $scope.goBack = function() {
            window.history.back();
        };
        
        var requestUri = 'https://api.stackexchange.com/2.2/questions/' + encodeURI($routeParams.questionId) + '?order=desc&sort=activity&site=stackoverflow';
        if ( soApiKey ){
            requestUri += '&key=' + soApiKey;
        }
        
        
        $http.get(requestUri)
                .success(function(data) {
                   var date = new Date(data.items['0'].last_activity_date * 1000);
                   $scope.date = date.toLocaleDateString();
                   $scope.score = data.items['0'].score;
                   $scope.title = data.items['0'].title;
                   $scope.tags = data.items['0'].tags;
                   $scope.display_name = data.items['0'].owner.display_name;
                   $scope.profile_image = data.items['0'].owner.profile_image;
                   $scope.answer_count  = data.items['0'].answer_count;
                });
        
        var requestUriAnswers = 'https://api.stackexchange.com/2.2/questions/' + encodeURI($routeParams.questionId) + '/answers?order=desc&sort=activity&site=stackoverflow';
        if ( soApiKey ){
            requestUriAnswers += '&key=' + soApiKey;
        }
        
        $http.get(requestUriAnswers)
                .success(function(data) {

                   $scope.answerItems = [];
                   var answers = data.items;
                   answers.forEach(function(item) {
                       var date = new Date(item.last_activity_date * 1000);
                       var answerItem = {
                         display_name: item.owner.display_name,
                         profile_image: item.owner.profile_image,
                         date: date.toLocaleDateString(),
                         answer_id: item.answer_id
                       };
                       $scope.answerItems.push(answerItem);
                   });
           
                });
    })
    
    .controller('SearchCtrl', function($scope, $routeParams, $http, $location, $compile) {

        $scope.header = 'Most relevant for <span class="highlight">' + $routeParams.query + '</span>';
                
        var requestUri = 'https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=activity&q='+ encodeURI($routeParams.query) +'&site=stackoverflow';
        if ( soApiKey ){
            requestUri += '&key=' + soApiKey;
        }

        var searchResultItems = [];

        $http.get(requestUri)
            .success(function(data) {
                // console.log('quota_remaining: ' + data.quota_remaining);
                $scope.hasLess = false;
                $scope.hasMore = data.has_more;
                var items = data.items;
                var id = 0;
                
                    items.forEach(function(item) {
                        var searchResultItem = {
                            id: ++id,
                            title: item.title,
                            question_id: item.question_id,
                            author: item.owner.display_name,
                            user_id: item.owner.user_id,
                            profile_image: item.owner.profile_image,
                            answers: item.answer_count,
                            tags: item.tags
                        };
                        searchResultItems.push(searchResultItem);
                 });
        });

        $scope.searchResultItems = searchResultItems;
                 
 
        $scope.sortType = 'id';
        $scope.sortReverse = false;
        
        $scope.goQuestion = function(question_id) {
            $location.path('/question/' + question_id);
        };
        
        $scope.goAuthor = function(author_id, author) {
               var divElement = angular.element(document.querySelector('#details'));
               divElement.empty();
               var appendHtml = $compile('<search-detail-author user=' + author_id + ' author="' + author  +'"></search-detail-author>')($scope);
               divElement.append(appendHtml);
            
        };
        
        $scope.goTag = function(tag) {
               var divElement = angular.element(document.querySelector('#details'));
               divElement.empty();
               var appendHtml = $compile('<search-detail-tag tag=' + tag + '></search-detail-tag>')($scope);
               divElement.append(appendHtml);
        };
                
    })
    
    .controller('SearchDetailAuthorCtrl', function($scope, $http) {
        
        $scope.header = 'Most popular by <span class="highlight">' + $scope.author + '</span>';  

        var requestUri = 'https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=votes&user=' + encodeURI($scope.user)  +'&site=stackoverflow';
        if ( soApiKey ){
            requestUri += '&key=' + soApiKey;
        }

        var searchResultItems = [];

        $http.get(requestUri)
            .success(function(data) {
                // console.log('quota_remaining: ' + data.quota_remaining);
                $scope.hasLess = false;
                $scope.hasMore = data.has_more;
                var items = data.items;
                
                    items.forEach(function(item) {
                        var searchResultItem = {
                            score: item.score,
                            title: item.title,
                            question_id: item.question_id,
                            author: item.owner.display_name,
                            user_id: item.owner.user_id,
                            profile_image: item.owner.profile_image,
                            answers: item.answer_count,
                            tags: item.tags
                        };
                        searchResultItems.push(searchResultItem);
                 });
        });

        $scope.searchResultItems = searchResultItems;
 
        $scope.sortType = 'id';
        $scope.sortReverse = false;
        

    })
    
    .controller('SearchDetailTagCtrl', function($scope, $http) {
        
        $scope.header = 'Most popular for tag <span class="highlight">' + $scope.tag + '</span>'; 

        var requestUri = 'https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=votes&tagged=' + encodeURI($scope.tag)+ '&site=stackoverflow';
        if ( soApiKey ){
            requestUri += '&key=' + soApiKey;
        }
        
                var searchResultItems = [];

        $http.get(requestUri)
            .success(function(data) {
                // console.log('quota_remaining: ' + data.quota_remaining);
                $scope.hasLess = false;
                $scope.hasMore = data.has_more;
                var items = data.items;
                
                    items.forEach(function(item) {
                        var searchResultItem = {
                            score: item.score,
                            title: item.title,
                            question_id: item.question_id,
                            author: item.owner.display_name,
                            user_id: item.owner.user_id,
                            profile_image: item.owner.profile_image,
                            answers: item.answer_count,
                            tags: item.tags
                        };
                        searchResultItems.push(searchResultItem);
                 });
        });

        $scope.searchResultItems = searchResultItems;
 
        $scope.sortType = 'id';
        $scope.sortReverse = false;
       
    })
    
    .directive('searchDetailAuthor', function() {
        return {
           restrict: "E",
           scope: {
               user: '@user',
               author: '@author',
               image: '@image'
           },
           templateUrl: 'templates/search_author.html',   
           controller: 'SearchDetailAuthorCtrl'
        };
    })
    
    .directive('searchDetailTag', function() {
        return {
           restrict: "E",
           scope: {
               tag: '@tag'
           },
           templateUrl: 'templates/search_tag.html',   
           controller: 'SearchDetailTagCtrl'
        };
    })
    

;