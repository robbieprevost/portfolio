exports.get = function(data, Action, actions){
    console.log(data);
    var https = require('https');
    var fs = require('fs');
    var callData = [];
    var searchTerm = encodeURI(data.searchTerm);
    var youtubeKey = '/youtube/v3/search?part=id' +
        '&q=' + searchTerm +
        '&key=AIzaSyBKZzO_zJCd1bkqXqkLIvLCJGQEEx_mfHQ';
    var options = {
        host: 'www.googleapis.com',
        path: youtubeKey
    };
    callback = function(response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            var jsonData = JSON.parse(str);
            if(jsonData.items[0]) {
                for (var i = 0; i < 5; i++) {
                    if(jsonData.items[i]){
                        callData[callData.length] = {
                            id: jsonData.items[i].id.videoId
                        };
                    }
                }
                var dataToSet = {
                    title: 'returnYoutubeData',
                    data: {
                        title: data.title,
                        ids: callData,
                        socket: data.socket
                    }
                };
                console.log(callData);
                actions.set(Action, dataToSet);
            }
        });
    };
    https.request(options, callback).end();
};
