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
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/dom",
  "dojo/on",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.3",
  //"calcite-maps/calcitemaps",
  "calcite-settings/panelsettings",

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
  watchUtils, query, domClass, domConstruct, dom, on, CalciteMapsSettings, PanelSettings) {
    console.log(" the map configuration is : " + mapConfig.initialCoordinates)
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
        panelSettings: null
    }

    //----------------------------------
    // App
    //----------------------------------
    // ---------- For Test Only ----- 
    var baseMaps = [];
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
       
    });
    app.basemaps = baseMaps;
    var customBasemapLayer = new MapImageLayer({ url: "http://gis.towerhamlets.gov.uk/arcgis/rest/services/CachedMaps/Ordnance_Survey_MasterMap_Colour_With_TFL_Data/MapServer" });
    var customBasemapLayer1 = new MapImageLayer({ url: "http://gis.towerhamlets.gov.uk/arcgis/rest/services/CachedMaps/OS_Greyscale/MapServer" });
    var customeBasemap = new Basemap({
        baseLayers: [customBasemapLayer],
      title: "Example Basemap 0",
      id: "terrific",
      thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
     });

    var customeBasemap1 = new Basemap({
        baseLayers: [customBasemapLayer1],
        title: "Example Basemap 1",
        id: "terrific",
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
    });

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
        createMouseLocation();
    }

    //----------------------------------
    // View Tabs
    //----------------------------------

    function setTabEvents() {

        // Tab event
        query(".calcite-navbar li a[data-toggle='tab']").on("show.bs.tab", function (e) {
            // Tabs
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
            console.log(isCustomBaseMap);
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

    //----------------------------------
    // Search Widgets
    //----------------------------------

    function setSearchWidgets() {

        //TODO - Search Nav + Panel (detach/attach)
        app.searchWidgetNav = createSearchWidget("searchNavDiv", true);
        app.searchWidgetPanel = createSearchWidget("searchPanelDiv", true);
        app.searchWidgetSettings = createSearchWidget("settingsSearchDiv", false);

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

    function createMouseLocation() {
        console.log(query(".esri-attribution__sources"));
       // var parent = query(".esri-attribution__sources")[0]
        //console.log(parent);
        //var n = domConstruct.create("div", { innerHTML: "helloWorld" });
        //domConstruct.place(n, parent, "after");
    }
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

});