exports.set = function(Action, dataToSet){
    var action = new Action({
        title: dataToSet.title,
        data: dataToSet.data
    }).save(function(){
            console.log('saved action');
        });
};
var http = require('http');
var Amazon = require('./apis/amazon');
var Youtube = require('./apis/youtube');
exports.get = function(Action, actions, io){
    Action.find({}, function(err, data){
        if(data[0]){
            if(data[0].title == 'getWeather'){
                var path = 'http://api.wunderground.com/api/cb0c55fa83eea946/geolookup/conditions/q/'
                            + data[0].data.data + '.json';
                http.get(path, function(res) {
                    var weather = '';
                    console.log("Got response: " + res);
                    res.on("data", function(chunk) {
                        weather = weather + chunk;
                    });
                    res.on("end", function(){
                        var dataToSend = JSON.parse(weather);
                        io.to(data[0].data.socket).emit('weatherResults', dataToSend);
                    });
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
                data[0].remove();
            }
            if (data[0].title == 'getAmazonResults') {
                console.log('ACTIONS::: ' + data);
                Amazon.search(data[0].data.data.searchTerm,
                    data[0].data.data.category,
                    data[0].data.socket, Action, actions);
                data[0].remove();
            }
            if(data[0].title == 'items'){
                //console.log('ITEMS::: ' + data);
                io.to(data[0].data.socket).emit('amazonResults', data[0].data.items);
                data[0].remove();
            }
            if(data[0].title == 'getYoutubeData'){
                Youtube.get(data[0].data, Action, actions);
                data[0].remove();
            }
            if(data[0].title == 'returnYoutubeData'){
                io.to(data[0].data.socket).emit('YoutubeIds', data[0].data.ids);
                data[0].remove();
            }
        }
    })
};
