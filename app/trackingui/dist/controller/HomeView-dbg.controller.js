sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.cy.track.trackingui.controller.HomeView", {
        onInit() {
        },
        onAdd:function(){
            var route=this.getOwnerComponent().getRouter();
            route.navTo("RouteDetailView");
    }
});
});