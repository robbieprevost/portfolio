var mongoose = require('mongoose');
var actions = require('./actions');
exports.start = function(io) {
    mongoose.connect('localhost:27017');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        console.log('Mongoose Connected!');

        var actionSchema = new mongoose.Schema({
            title: String,
            data: {}
        });

        var Action = mongoose.model('Action', actionSchema);
        var actionsInterval = setInterval(function(){
            actions.get(Action, actions, io);
        }, 500);

        io.on('connection', function(socket){
            console.log('io connected to ' + socket.id );
            var socketId = socket.id;
            socket.on('getWeather', function(data){
                console.log('get weather');
                var dataToSet = {
                    title: 'getWeather',
                    data: {
                        data: data,
                        socket: socketId
                    }
                };
                actions.set(Action, dataToSet);
            });
            socket.on('getAmazonResults', function(data){
                console.log('get amazon results');
                var dataToSet = {
                    title: 'getAmazonResults',
                    data: {
                        data: {
                            category: data.category,
                            searchTerm: data.searchTerm
                        },
                        socket: socketId
                    }
                };
                actions.set(Action, dataToSet);
            });
            socket.on('getYoutube', function(data){
               console.log('get youtube');
                var dataToSet = {
                    title: 'getYoutubeData',
                    data: {
                        searchTerm : data,
                        socket: socketId
                    }
                };
                actions.set(Action, dataToSet);
            });
        });
    });
};