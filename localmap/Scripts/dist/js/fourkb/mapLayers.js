define(["esri/layers/MapImageLayer",
        "esri/layers/FeatureLayer"], function (MapImageLayer, FeatureLayer) {
    var mapLayers = [];
    if (layersConfig) {
        dojo.forEach(layersConfig.layers, function (l, i) {
            var layer;
            if (l.layerType === "imagelayer") {
                layer = new MapImageLayer({
                    url: l.url,
                    sublayers: l.sublayers,
                    visible: l.visible ? l.visible : false,
                    title: "lolli_" + i,
                    id: "pareshaan_" + i
                });
            }
            else if (l.layerType === "featurelayer") {
                layer = new FeatureLayer({
                    url: l.url,
                    title: l.title,
                    id:l.title+"_"+i+"_feature"
                })
            }
           
            if (layer && l.layerType === "featurelayer") {
                mapLayers.push(layer);

                layer.then(function (e) {
                    if (e && e.title) {
                        console.log("layer " + e.title + " of type : " + l.layerType + " added to map");
                    }
                }, function (f) {
                    if (f) {
                        console.log(f);
                        console.log("layer  of type : " + l.layerType + " added to map");
                    }
                });


                layer.on("layerview-create", function (event) {
                    // The LayerView for the layer that emitted this event
                    console.log(event.layerView);
                });
                };
            
        });
    }
    var GetLayerTree = function(){
        dojo.forEach(mapLayers, function (layer, i) {
            console.log(layer.name);

        })
    }
    return mapLayers;
});