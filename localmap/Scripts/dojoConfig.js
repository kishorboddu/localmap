var dojoConfig = {
    packages: [{
        name: "bootstrap",
        location: location.origin + "/Scripts/dist/vendor/dojo-bootstrap"
    },
    {
        name: "calcite-maps",
        location: location.origin + "/Scripts/dist/js/dojo"
        //location: location.pathname.replace(/\/[^/]+$/, "") + "./../../lib/js/dojo"
    },
    {
        name: "calcite-settings",
        location: location.origin + "/Scripts/dist/settings"
    },
    {
        name: "fourkb-layers",
        location: location.origin + "/Scripts/dist/js/fourkb"
    }]
};