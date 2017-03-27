define(["esri/Basemap",
    "esri/layers/MapImageLayer",
   "dojo/json",
   "dojo/domReady!"], function (Basemap,MapImageLayer, json) {
    var baseMaps = [];
    if(mapConfig){
        dojo.forEach(mapConfig.baseMaps, function (bm, i) {
            baseMaps.push({
                "id": bm.id,
                "basemap": new Basemap({
                    baseLayers: [new MapImageLayer({ url: bm.url })],
                    title: bm.title,
                    id: bm.id,
                    thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
                })
            });
        })}
    return baseMaps;
})