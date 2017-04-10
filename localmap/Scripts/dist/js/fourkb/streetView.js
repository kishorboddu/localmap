define(["esri/geometry/SpatialReference",
    "esri/geometry/Point",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/layers/GraphicsLayer",
    "esri/symbols/PictureMarkerSymbol",
     "esri/Graphic",
      "esri/geometry/Point",
      "esri/geometry/support/webMercatorUtils",
    "dojo/query",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/touch",
  "dojo/on",
  "dojo/keys",
  "dojo/_base/lang",
  "dojo/_base/declare",
  "dojo/domReady!"], function (SpatialReference, Point, GeometryService, ProjectParameters, GraphicsLayer, PictureMarkerSymbol, Graphic, Point, webMercatorUtils, query, domclass, domstyle, touch, dom, keys, lang, declare) {

      var STREET_VIEW_SETTINGS = {
          "pitch": 165
      }
      var OSGBSR = new SpatialReference(27700);
      var webMercatorSR = new SpatialReference(3857);
      var WGS84 = new SpatialReference(4326);
      // Create a symbol for drawing the point
      var markerSymbol = new PictureMarkerSymbol({
          url: "../../../nav.png",
          width: "30px",
          height: "30px"
      });
      var StreetView = declare(null, {
          _panorama: null,
          _this : null,
          _graphic: null,
          _currentLocation: { lat: 0, lng: 0 },
          constructor: function(options) {
              _this = this;
              _this.options = lang.mixin(lang.clone(_this.defaultOptions), (options || {}));
              _this.app = options.app;
              _panorama = options.panorama;
              _this._createGraphicsLayer();
              _this._initStreetView();
          },
          _createGraphicsLayer: function () {
              _graphic = new Graphic({
                  symbol: markerSymbol,
                  geometry: new Point({ spatialReference: OSGBSR, x: _this.app.mapView.center.x, y: _this.app.mapView.center.y})
              });
              _this.app.mapView.graphics.add(_graphic);
          },
          _initStreetView : function(){
              _panorama.addListener('position_changed', function () {
                  _this.getOSGBCoordinates(_panorama.getPosition().lat(), _panorama.getPosition().lng());
              });
              _panorama.addListener('pov_changed', function () {
                  _this._updateMarkerDirection(_panorama.getPov().heading);
              });
          },
          _updateMarkerDirection: function (angle) {
              markerSymbol.angle = angle;           
              _graphic.symbol.angle = angle;
          },
          getOSGBCoordinates:function(lat,lng){
              var lngOut = null;
              var latOut = null;
              var p = new Point({ latitude: lat, longitude: lng, spatialReference: WGS84 });
              var geomSer = new GeometryService({ url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
              var params = new ProjectParameters();
              params.geometries = [p];
              params.outSR = OSGBSR;
              geomSer.project(params).then(function (data) {
                  latOut = data[0].y;
                  lngOut= data[0].x;
                  if (latOut && lngOut) {
                       _this.app.mapView.graphics.removeAll();
                      _graphic = new Graphic({
                          symbol: markerSymbol,
                          geometry: new Point({ spatialReference: OSGBSR, x: lngOut, y: latOut })
                      });
                      _this.app.mapView.graphics.add(_graphic);
                }
              }); 
          },
          _getOSGBFromWebMerc: function (lat, lng) {
              var x;
              var y;
              var p = new Point({ latitude: lat, longitude: lng, spatialReference: WGS84 })
              var geomSer = new GeometryService({ url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
              var params = new ProjectParameters();
              params.geometries = [p];
              params.outSR = OSGBSR;
              params.transformation = { wkid: 1314 };
              geomSer.project(params).then(function (data) {
                  if (data && data.length > 0) {
                      x = data[0].x;
                      y = data[0].y;
                  }
              });
          },
          getLatLongsFromOSGB: function (x, y) {
                var lat;
                var lat ; 
                var p = new Point({ x: x, y: y, spatialReference: OSGBSR })
                if (webMercatorUtils.canProject(OSGBSR, webMercatorSR)) {
                    p = webMercatorUtils.project(p, webMercatorSR);
                    var position = {
                        lat: p.latitude, lng: p.longitude
                    };
                    _panorama.setPosition(position);

                }
                else {
                    var geomSer = new GeometryService({ url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
                    var params = new ProjectParameters();
                    params.geometries = [p];
                    params.outSR = webMercatorSR;
                    params.transformation = { wkid: 5339 };
                    geomSer.project(params).then(function (data) {
                        if (data && data.length > 0) {
                            lat = data[0].latitude;
                            lng = data[0].longitude;
                            
                            var position = {
                                lat: lat, lng: lng
                            };
                            console.log(position);
                            _panorama.setPosition(position);
                        }
                    });
                }
            }
        });
        return StreetView;
});
