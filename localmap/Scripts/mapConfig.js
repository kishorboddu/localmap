var mapConfig;
require(["dojo/json"], function (json) {
    dojo.xhrGet({
        url: "./../mapConfig.json",
        handleAs: "json",
        handle: function (data, args) {
            mapConfig = data;
        }
    });
})