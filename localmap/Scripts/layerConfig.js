var layersConfig;
require(["dojo/json"], function (json) {
    dojo.xhrGet({
        url: "./../layerConfig.json",
        handleAs: "json",
        handle: function (data, args) {
            layersConfig = data;
        }
    });
})