sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.cy.track.trackingui.controller.HomeView", {
        onInit() {
        },
        onAdd: function () {
            var route = this.getOwnerComponent().getRouter();
            const oModel = this.getOwnerComponent().getModel("ExpenseClaimModel");
            oModel.setData({
                employeeID: "",
                employeeName: "",
                claimType: "",
                claimCategory: "",
                claimFees: "",
                validityDate: "",
                status: "New",
                localEmployees: [],
                claimSummary: [],
                employee: "",
                employee1: "",
                employee2: ""
            });
            route.navTo("RouteDetailView");
        },

        onListItemPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem"); // for sap.m.Table use 'listItem'

            const oContext = oItem.getBindingContext();
            if (!oContext) {
                console.error("No context found");
                return;
            }

            const oData = oContext.getObject();
            const sClaimID = oData.claimID;

            if (!sClaimID) {
                sap.m.MessageBox.error("Invalid claim selected. Missing claim ID.");
                return;
            }

            const oLocalModel = this.getOwnerComponent().getModel("ExpenseClaimModel");
            oLocalModel.setProperty("/selectedClaim", oData);
            oLocalModel.setProperty("/editable", oData.status === "Draft");

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetailView", {
                claimId: sClaimID
            });
        }
    })
})
