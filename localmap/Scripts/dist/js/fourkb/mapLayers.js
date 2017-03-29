define(["esri/layers/MapImageLayer"], function (MapImageLayer) {
    var mapLayers = [];
    if (layersConfig) {
        dojo.forEach(layersConfig.layers, function (l, i) {
            var layer = new MapImageLayer({
                url: l.url,
                sublayers: l.sublayers,
                visible : l.visible ? l.visible : false
            });

            mapLayers.push(layer);
        });
    }
    return mapLayers;
});