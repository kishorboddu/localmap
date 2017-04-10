var mapConfig;
var centerPointXX;
require(["esri/geometry/SpatialReference",
    "esri/geometry/Point",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "dojo/json"], function (SpatialReference, Point, GeometryService, ProjectParameters, json) {
        dojo.xhrGet({
            url: "./../mapConfig.json",
            handleAs: "json",
            handle: function (data, args) {
                mapConfig = data;
                var sp = new SpatialReference(27700);
                var outSP = new SpatialReference(3857);
                var p = new Point({ x: mapConfig.initialCoordinates[0], y: mapConfig.initialCoordinates[1], spatialReference: sp })
                var geomSer = new GeometryService({ url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
                var params = new ProjectParameters();
                params.geometries = [p];
                params.outSR = outSP;
                params.transformation = { wkid: 5339 };
                geomSer.project(params).then(function (data) {
                    console.log(data);
                });
            }
        });
    });