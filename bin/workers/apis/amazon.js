exports.search = function(searchTerm, category, socket, Action, actions) {
    var aws = require('aws-lib');
    var secretKey = secretKey;
    var accessKey = accessKey;
    var results;
    var page = 1;
    var Items = [];
    var prodAdv = aws.createProdAdvClient(accessKey, secretKey, 'theuniser-20');
    //searchTerm = searchTerm.replace(/ /g,"");
    console.log('Search term::: ' + searchTerm + ' Category:::  ' + category);
    function searchItems(secretKey, accessKey, cb){
        return prodAdv.call("ItemSearch",
            {   SearchIndex: category,
                Keywords: searchTerm,
                ItemPage: page,
                IncludeReviewsSummary: 'true',
                ResponseGroup: 'ItemAttributes,Images,OfferListings'},
            function(err, result) {
                var results = '';
                //console.log(result.Items.Request.Errors);
                if(err){
                    console.log(cb(err.message));
                } else {
                    //console.log(result.Items);
                    if(result.Items.Request.Errors) {
                        return cb("not found");
                    }
                    else{
                        results = result;
                        cb(null, results);
                    }
                }
            });
    }

    function sortReults(results){
        var index = Items.length;
        for (var i = 0; i < results.Items.Item.length; i++) {
            //console.log(results.Items.Item[i]);
            var item = results.Items.Item[i];
            //console.log(item);
            if(item.Offers) {
                Items[index + i] = {
                    ASIN: item.ASIN,
                    DetailPageURL: item.DetailPageURL,
                    ImageSets: {
                        ImageSet: []
                    },
                    ItemAttributes: item.ItemAttributes,
                    Offer: item.Offers.Offer
                };
                if (item.ImageSets) {
                    if (item.ImageSets.ImageSet.length > 1) {
                        for (var j = 0; j < item.ImageSets.ImageSet.length; j++) {

                            Items[index + i].ImageSets.ImageSet[j] = {
                                LargeImage: {}
                            };
                            if (item.ImageSets.ImageSet[j].LargeImage) {
                                Items[index + i].ImageSets.ImageSet[j].LargeImage = item.ImageSets.ImageSet[j].LargeImage;
                            }
                        }
                    } else {
                        Items[index + i].ImageSets.ImageSet[0] = {
                            LargeImage: {}
                        };
                        //console.log(item.ASIN + " " + item.ASIN + " " + item.ASIN);
                        //console.log("IMAGESETS::::::::::::::::::::" + JSON.stringify(item.ImageSets));
                        if (item.ImageSets.ImageSet.LargeImage) {
                            Items[index + i].ImageSets.ImageSet[0].LargeImage = item.ImageSets.ImageSet.LargeImage;
                        } else if (item.ImageSets.ImageSet.MediumImage) {
                            Items[index + i].ImageSets.ImageSet[0].MediumImage = item.ImageSets.ImageSet.MediumImage;
                        }
                    }
                    //console.log(Items[i]);
                } else {
                    Items[index + i].ImageSets.ImageSet = null;
                }
            }
            //console.log(Items[i]);
        }

        if(Items.length >= 10) {

            var dataToSet = {
                title: 'items',
                data: {
                    items: Items,
                    socket: socket
                }
            };
            actions.set(Action, dataToSet);
            //console.log(JSON.stringify(results));

        }else{
            page++;
            setTimeout(function(){
                getResults();
            }, 100);

        }

    }

    function getResults(){
        searchItems(secretKey, accessKey, function(err, results){

            //console.log(results);
            if(results) {
                sortReults(results);
            }else{
                console.log('no results');
            }
        });
    }

    getResults();
};