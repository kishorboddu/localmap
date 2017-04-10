var app;

require([
  // ArcGIS
  "esri/Map",
  "esri/Basemap",
   "esri/layers/MapImageLayer",
  "esri/layers/VectorTileLayer",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/widgets/Search",
  "esri/widgets/Popup",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/ColorPicker",
  "esri/core/watchUtils",
  "dojo/query",
  "dojo/html",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/dom",
  "dojo/on",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.3",
  //"calcite-maps/calcitemaps",
  "calcite-settings/panelsettings",

  //fourkb
  "fourkb-layers/customBasemaps",
  "fourkb-layers/mapLayers",
  "fourkb-layers/streetView",

  // Boostrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Carousel",
  "bootstrap/Tooltip",
  "bootstrap/Modal",

  // Dojo
  "dojo/domReady!"
], function (Map, Basemap, MapImageLayer,VectorTileLayer, MapView, SceneView, Search, Popup, Home, Legend, ColorPicker,
  watchUtils, query, html, domClass, domConstruct, dom, on, CalciteMapsSettings, PanelSettings, CustomBasemaps, mapLayers, StreetView) {
    app = {
        scale: mapConfig.initialScale,
        lonlat: mapConfig.initialCoordinates,
        mapView: null,
        mapDiv: "mapViewDiv",
        mapFL: null,
        vectorLayer: null,
        sceneView: null,
        sceneDiv: "sceneViewDiv",
        sceneFL: null,
        activeView: null,
        searchWidgetNav: null,
        searchWidgetPanel: null,
        searchWidgetSettings: null,
        basemapSelected: "towerColour",
        basemapSelectedAlt: "gray",
        padding: {
            top: 85,
            right: 0,
            bottom: 0,
            left: 0
        },
        uiPadding: {
            components: ["zoom", "attribution", "home"],
            padding: {
                top: 15,
                right: 15,
                bottom: 30,
                left: 15
            }
        },
        popupOptions: {
            autoPanEnabled: true,
            messageEnabled: false,
            spinnerEnabled: false,
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: true,
                breakpoint: 544 // default
            }
        },
        colorPickerWidget: null,
        panelSettings: null,
        overViewMapDiv: "overViewMap",
        overViewMapView:null
    }

    //----------------------------------
    // App
    //----------------------------------
    // ---------- For Test Only ----- 
    if (CustomBasemaps) {
        app.basemaps = CustomBasemaps;
    }
   app.customMapLayers = mapLayers;
    // -----End Of Test
    initializeMapViews();
    initializeAppUI();

    // Panel settings
    app.panelSettings = new PanelSettings({ app: app });
    app.panelSettings.activeLayout = app.panelSettings.APP_LAYOUTS.TOP;
    app.panelSettings.setLayout(app.panelSettings.activeLayout, false);

    // Set padding for navs that change height
    if (window.innerWidth < app.activeView.breakpoints.small && app.panelSettings.activeLayout.viewPaddingSmallScreen) {
        app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPaddingSmallScreen, app.panelSettings.activeLayout.uiPadding);
    }

    //----------------------------------
    // Map and Scene View
    //----------------------------------

    function initializeMapViews() {
        //2D - MapView
        app.mapView = new MapView({
            container: app.mapDiv,
            map: new Map({ basemap: app.basemapSelected, constraints: { snapToZoom: false } }),
            scale: app.scale,
            center: app.lonlat,
            padding: app.padding,
            ui: app.uiPadding,
            popup: new Popup(app.popupOptions),
            visible: true
        });

        app.overViewMapView = new MapView({
            container: app.overViewMapDiv,
            map: new Map({ basemap: app.basemapSelected, constraints: { snapToZoom: false } }),
            scale: app.scale,
            center: app.lonlat,
            padding: {
                top:0,
                right: 0,
                bottom: 0,
                left: 0
            },
            visible: true
        });

        //app.mapView.ui.add(new Home({view: app.mapView}), "top-left");

        //Set active view
        app.activeView = app.mapView;

        //3D - SceneView
        app.sceneView = new SceneView({
            container: app.sceneDiv,
            map: new Map({ basemap: app.basemapSelectedAlt, ground: "world-elevation", constraints: { snapToZoom: false } }),

            scale: app.scale,
            center: app.lonlat,
            padding: app.padding,
            ui: app.uiPadding,
            popup: new Popup(app.popupOptions),
            visible: false
        });

        //app.sceneView.ui.add(new Home({view: app.sceneView}), "top-left");

        // Listen for view breakpoint changes and update control location
        app.mapView.watch("widthBreakpoint", function (newVal, oldVal) {
            function setPadding(newVal, oldVal) {
                if (newVal === "small" && oldVal === "medium") {
                    app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPaddingSmallScreen, app.panelSettings.activeLayout.uiPadding);
                } else if (newVal === "medium" && oldVal === "small") {
                    app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPadding, app.panelSettings.activeLayout.uiPadding);
                }
            }
            // Set padding for navs that change height
            if (app.panelSettings.activeLayout.viewPaddingSmallScreen) {
                setPadding(newVal, oldVal);
            }
        });
    }

    //----------------------------------
    // App UI Handlers
    //----------------------------------

    function initializeAppUI() {
        // App UI
        setTabEvents();
        setBasemapEvents();
        setSearchWidgets();
        setColorPicker();
        setPopupPanelEvents();
        setPopupEvents();
        //createMouseLocation();
    }

    //----------------------------------
    // View Tabs
    //----------------------------------

    function setTabEvents() {

        // Tab event
        query(".calcite-navbar li a[data-toggle='tab']").on("show.bs.tab", function (e) {
            // Tabs
            if (e.target.text.indexOf("Street") > -1) {
               // alert('Selected street view')
                SwithToGoogleStreetView();
                return false;
            }
            else if (e.target.text.indexOf("Bing") > -1) {
                alert('Selected Bingmap View')
                return false;
            }
            syncTabs(e);
            // Views
            if (e.target.text.indexOf("Map") > -1) {
                syncViews(app.sceneView, app.mapView);
                app.activeView = app.mapView;
            } else {
                syncViews(app.mapView, app.sceneView);
                app.activeView = app.sceneView;
            }
            // Search
            syncSearch();
            // Hide popup - TODO
            app.activeView.popup.set({
                visible: false
            });
        });
        //Google street view

        function SwithToGoogleStreetView() {
            on.emit(query("#googleStreetViewNavbar")[0], "click", {
                bubbles: true,
                cancelable: true
            });
        }

        // Tabs
        function syncTabs(e) {
            query(".calcite-navbar li.active").removeClass("active");
            query(e.target).addClass("active");
        }

        // Views
        function syncViews(fromView, toView) {
            watchUtils.whenTrueOnce(toView, "ready").then(function (result) {
                watchUtils.whenTrueOnce(toView, "stationary").then(function (result) {
                    toView.goTo(fromView.viewpoint);
                    toView.popup.reposition();
                });
            });
        }

        // Search
        function syncSearch() {
            app.searchWidgetNav.view = app.activeView;
            app.searchWidgetPanel.view = app.activeView;
            app.searchWidgetSettings.view = app.activeView;
            // Sync
            if (app.searchWidgetNav.selectedResult) {
                app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
            }
            if (app.searchWidgetPanel.selectedResult) {
                app.searchWidgetPanel.search(app.searchWidgetPanel.selectedResult.name);
            }
        }
    }

    //----------------------------------
    // Basemaps
    //----------------------------------

    function setBasemapEvents() {

        // Sync basemaps for map and scene
        query("#selectBasemapPanel, #settingsSelectBasemap").on("change", function (e) {
            app.basemapSelected = e.target.options[e.target.selectedIndex].dataset.vector;
            app.basemapSelectedAlt = e.target.value;
            var isCustomBaseMap = e.target.options[e.target.selectedIndex].dataset.custom;
   
            setBasemaps(isCustomBaseMap);
        });

        function setBasemaps(isCustomBaseMap) {
            if (isCustomBaseMap)
            {
                var customBasemap;
                    dojo.map(app.basemaps, function (item) {
                        if (item.id === app.basemapSelected) {
                            customBasemap = item.basemap
                            return false;
                        }
                });
                app.mapView.map.basemap = customBasemap;
            }
            else {
                app.mapView.map.basemap = app.basemapSelected;
                app.sceneView.map.basemap = app.basemapSelectedAlt;
            }
        }
    }
    on.emit(query("#selectBasemapPanel, #settingsSelectBasemap")[0], "change", {
        bubbles: true,
        cancelable: true
    });
    //----------------------------------
    // Search Widgets
    //----------------------------------

    function setSearchWidgets() {

        //TODO - Search Nav + Panel (detach/attach)
        app.searchWidgetNav = createSearchWidget("searchNavDiv", true);
        app.searchWidgetPanel = createSearchWidget("searchPanelDiv", true);
        app.searchWidgetSettings = createSearchWidget("settingsSearchDiv", true);

        // Create widget
        function createSearchWidget(parentId, showPopup) {
            var search = new Search({
                viewModel: {
                    view: app.activeView,
                    showPopupOnSelect: showPopup,
                    highlightEnabled: false,
                    maxSuggestions: 4
                },
            }, parentId);
            search.startup();
            return search;
        }
    }

    //----------------------------------
    // Colorpicker Widget
    //----------------------------------

    function setColorPicker() {
        app.colorPickerWidget = new ColorPicker({
            required: false,
            showRecentColors: false,
            showTransparencySlider: false
        }, "colorPickerDiv");
        app.colorPickerWidget.startup();
    }

    //----------------------------------
    // Popups and Panels
    //----------------------------------

    function setPopupPanelEvents() {

        // Views - Listen to view size changes to show/hide panels
        app.mapView.watch("size", viewSizeChange);
        app.sceneView.watch("size", viewSizeChange);

        function viewSizeChange(screenSize) {
            if (app.screenWidth !== screenSize[0]) {
                app.screenWidth = screenSize[0];
                setPanelVisibility();
            }
        }

        // Popups - Listen to popup changes to show/hide panels
        app.mapView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);
        app.sceneView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);

        // Panels - Show/hide the panel when popup is docked
        function setPanelVisibility() {
            var isMobileScreen = app.activeView.widthBreakpoint === "xsmall" || app.activeView.widthBreakpoint === "small",
             isDockedVisible = app.activeView.popup.visible && app.activeView.popup.currentDockPosition,
             isDockedBottom = app.activeView.popup.currentDockPosition && app.activeView.popup.currentDockPosition.indexOf("bottom") > -1;
            // Mobile (xsmall/small)
            if (isMobileScreen) {
                if (isDockedVisible && isDockedBottom) {
                    query(".calcite-panels").addClass("invisible");
                } else {
                    query(".calcite-panels").removeClass("invisible");
                }
            } else { // Desktop (medium+)
                if (isDockedVisible) {
                    query(".calcite-panels").addClass("invisible");
                } else {
                    query(".calcite-panels").removeClass("invisible");
                }
            }
        }

        // Panels - Dock popup when panels show (desktop or mobile)
        query(".calcite-panels .panel").on("show.bs.collapse", function (e) {
            if (app.activeView.popup.currentDockPosition || app.activeView.widthBreakpoint === "xsmall") {
                app.activeView.popup.dockEnabled = false;
            }
        });

        // Panels - Undock popup when panels hide (mobile only)
        query(".calcite-panels .panel").on("hide.bs.collapse", function (e) {
            if (app.activeView.widthBreakpoint === "xsmall") {
                app.activeView.popup.dockEnabled = true;
            }
        });
    }

    //----------------------------------
    // Popup collapse (optional)
    //----------------------------------

    function setPopupEvents() {
        query(".esri-popup__header-title").on("click", function (e) {
            query(".esri-popup__main-container").toggleClass("esri-popup-collapsed");
            app.activeView.popup.reposition();
        }.bind(this));
    }
    // fourkb customization
    //----------------
    app.mapView.on('pointer-move', function (evt) {
        var point = app.mapView.toMap({ x: evt.x, y: evt.y });
        html.set(dom.byId("mousePosition"), point.x.toFixed(0) + " " + point.y.toFixed(0));
    });

    app.customMapLayers = mapLayers;
    app.basemaps = CustomBasemaps;
    if (app.customMapLayers && app.customMapLayers.length > 0) {
        dojo.forEach(app.customMapLayers, function (ml) {
            //app.mapView.map.layers.add(ml);
        })
      
    }
   

   
    //-----------------------
    // End Of Fourkbs customization

    //----------------------------------
    // Toggle nav
    //----------------------------------
    // query("#calciteToggleNavbar").on("click", function(e) {
    //   var padding;
    //   if (query(".calcite-nav-hidden").length > 0) { // hidden
    //     //app.panelSettings.setLayout(app.panelSettings.activeLayout, true);
    //     //query(".calcite-panels .panel.in").collapse("hide");
    //   } else {
    //     //app.panelSettings.setLayout(app.panelSettings.activeLayout, false);
    //   }
    //   query(".calcite-dropdown").removeClass("open");
    //   query(".calcite-dropdown-toggle").removeClass("open");
    // });

    //----------------------------------
    // Manual show/hide menu dropdown (slide)
    //----------------------------------

    // query(".dropdown-toggle").on('click', function (e) {
    //   // Show dropdown nav
    //   query(this).parent().toggleClass("open");
    //   // Menu animcation
    //   query(".calcite-dropdown-toggle").toggleClass("open");
    // });

    app.mapView.on("click", function (evt) {
        // Print out the current state of the
        // drag event.
      //  console.log("drag state", evt.action);
        if (evt && evt.mapPoint)
            sv.getLatLongsFromOSGB(evt.mapPoint.x, evt.mapPoint.y);
    });

    app.mapView.on("drag", function (evt) {
        // Print out the current state of the
        // drag event.
        //  console.log("drag state", evt.action);
        if (evt && evt.action && evt.action === "end")
            app.overViewMapView.center = app.mapView.center;
    });



    var sv = new StreetView({ app: app , panorama : _panoramaX});

  
       


});