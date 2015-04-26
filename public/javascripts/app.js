
var myApp = angular.module('myApp', ['ngRoute']).factory('socket', function ($rootScope) {
    var socket = io.connect('45.55.242.100:80');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}).config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://www.youtube.com/**']);
});

var myController = myApp.controller('myController', function($scope, $rootScope, socket){

    $scope.data = {
        home: true,
        about: false,
        widgets: false,
        widgetsHome: false,
        contact: false,
        weather: false,
        amazon: false,
        amazonSearch: false,
        amazonCategory: 'All',
        amazonSearchTerm: '',
        amazonResultDetails: false,
        amazonResultMainImage: '',
        amazonResult: {},
        amazonResults: [],
        youtubeIds: [{},{},{},{},{}],
        weatherResults: {
            temp       : undefined,
            city       : undefined,
            conditions : undefined,
            img        : undefined
        },
        weatherError: false,
        weatherZip: ''
    };
    $scope.workers = {
        init : function(){
            $scope.data.currentFocus = 'home';
        },
        homeTitleClick: function(){
            $scope.data.home = true;
            $scope.data.about = false;
            $scope.data.widgets = false;
            $scope.data.contact = false;
            $scope.data.amazonResultDetails = false;
        },
        aboutTitleClick: function(){
            $scope.data.home = false;
            $scope.data.about = true;
            $scope.data.widgets = false;
            $scope.data.contact = false;
            $scope.data.amazonResultDetails = false;
        },
        widgetsTitleClick: function(){
            $scope.data.home = false;
            $scope.data.about = false;
            $scope.data.widgets = true;
            $scope.data.widgetsHome = true;
            $scope.data.weather = false;
            $scope.data.amazon = false;
            $scope.data.contact = false;
            $scope.data.amazonResultDetails = false;
        },
        contactTitleClick: function(){
            $scope.data.home = false;
            $scope.data.about = false;
            $scope.data.widgets = false;
            $scope.data.contact = true;
            $scope.data.amazonResultDetails = false;
        },
        weather: function() {
            console.log('weather');
            $scope.data.widgetsHome = false;
            $scope.data.weather = true;
            $scope.data.amazonResultDetails = false;
        },
        getWeather : function(){
            if($scope.data.weatherZip != ''){
                socket.emit('getWeather', $scope.data.weatherZip);
            }
        },
        amazon: function(){
            console.log('amazon');
            $scope.data.widgetsHome = false;
            $scope.data.amazon = true;
            $scope.data.amazonSearch = true;
            $scope.data.amazonResultDetails = false;
        },
        amazonSearch: function(){
            if($scope.data.amazonSearchTerm != ''){
                var dataToSend = {
                    category: $scope.data.amazonCategory,
                    searchTerm: $scope.data.amazonSearchTerm
                };
                socket.emit('getAmazonResults', dataToSend);
            }
        },
        amazonResult: function(result){
            $scope.data.amazonSearch = false;
            $scope.data.amazonResultDetails = true;
            $scope.data.amazonResult = result;
            if($scope.data.amazonResult.ImageSets.ImageSet[0].LargeImage.URL){
                $scope.data.amazonResultMainImage =
                    $scope.data.amazonResult.ImageSets.ImageSet[0].LargeImage.URL;
            }
            socket.emit('getYoutube', $scope.data.amazonResult.ItemAttributes.Title);
        },
        amazonResultAltImage: function(URL){
            console.log(URL);
            $scope.data.amazonResultMainImage = URL;

        },
        amazonBack: function(){
            $scope.data.amazonSearch = true;
            $scope.data.amazonResultDetails = false;
            $scope.data.youtubeIds = [{},{},{},{},{}];
        }
    };
    socket.on('weatherResults', function(data){
        if(data.response.error){
            console.log(data.response.error);
            $scope.data.weatherError = true;
            $scope.data.weatherZip = '';
        }else{
            $scope.data.weatherError = false;
            $scope.data.weatherResults.temp = data.current_observation.temperature_string;
            $scope.data.weatherResults.city = data.current_observation.display_location.full;
            $scope.data.weatherResults.conditions = data.current_observation.icon;
            $scope.data.weatherResults.img = data.current_observation.icon_url;
            $scope.data.weatherZip = '';
        }
        console.log($scope.data.weatherResults)
    });
    socket.on('amazonResults', function(data){
        $scope.data.amazonSearchTerm = '';
        console.log(data);
        $scope.data.amazonResults = data;
    });
    socket.on('YoutubeIds', function(data){
        //console.log(JSON.stringify(data));
        for(var i = 0; i < data.length;i++) {
            if (data[i].id) {
                $scope.data.youtubeIds[i].id = 'https://www.youtube.com/embed/' + data[i].id;
            }
        }
    });
});