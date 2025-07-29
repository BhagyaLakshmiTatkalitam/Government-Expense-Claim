sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator"
  ], (Controller, JSONModel,Filter,FilterOperator) => {
    "use strict";
  
    return Controller.extend("com.cy.track.trackingui.controller.DetailView", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("RouteDetailView").attachPatternMatched(this._ExpenseDetailMatched, this);
        
      },
      _ExpenseDetailMatched:function(){
        this.getOwnerComponent().getModel("ExpenseClaimModel").setProperty("/employeeName","Bhagya lakshmi")
      },
      onAdd: function () {
        const oModel = this.getView().getModel("ExpenseClaimModel");
        const aEmployees = oModel.getProperty("/localEmployees") || [];
  
        // Push a new empty row
          aEmployees.push({
          employeeID: "",
          employeeName: "",
          status: "",
          payGrade: "",
          action: ""
        });
  
        oModel.setProperty("/localEmployees", aEmployees);
        oModel.updateBindings(true);
      },
      onEmployeeIdSelected: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) return;
  
        const sEmployeeID = oSelectedItem.getText();
        const oInput = oEvent.getSource();
        const oRowContext = oInput.getBindingContext("ExpenseClaimModel"); // from local model
        const oView = this.getView();
        const oODataModel = oView.getModel();
        const oLocalModel = oView.getModel("ExpenseClaimModel"); 
  
        
        const oFilter = new Filter("employeeID", FilterOperator.EQ, sEmployeeID);
        const oListBinding = oODataModel.bindList("/Employees", undefined, [], [oFilter]);
  
        oListBinding.requestContexts(0, 1).then((aContexts) => {
            if (!aContexts.length) {
                console.error("No employee found with ID:", sEmployeeID);
                return;
            }
  
            const oEmployee = aContexts[0].getObject();
  
            //extract index from path like "/localEmployees/0"
            if (!oRowContext || !oRowContext.getPath()) {
                console.error("Row context is missing. Cannot update local row.");
                return;
            }
  
            const sRowPath = oRowContext.getPath(); // /localEmployees/0"
            const sIndex = sRowPath.split("/").pop();
            const iIndex = parseInt(sIndex, 10);
  
            if (isNaN(iIndex)) {
                console.error("Invalid row index extracted from path:", sRowPath);
                return;
            }
  
            const aEmployees = oLocalModel.getProperty("/localEmployees");
  
            if (aEmployees[iIndex]) {
                aEmployees[iIndex] = {
                    employeeID: oEmployee.employeeID,
                    employeeName: oEmployee.employeeName,
                    status: oEmployee.status,
                    payGrade: oEmployee.payGrade,
                    action: oEmployee.action
                };
  
                oLocalModel.setProperty("/localEmployees", aEmployees);
                oLocalModel.updateBindings(true);
            }
        }).catch((err) => {
            console.error("Error while filtering Employees by employeeID:", err);
        });
          },
          
          onEmployeeIdSubmit: function (oEvent) {
            const sEmpID = oEvent.getSource().getValue();
            const oView = this.getView();
            const oModel = oView.getModel(); // OData model
        
            if (!sEmpID) {
                sap.m.MessageToast.show("Please enter an Employee ID.");
                return;
            }
        
            const oFilter = new Filter("employeeID", FilterOperator.EQ, sEmpID);
            const oBinding = oModel.bindList("/Employees", undefined, undefined, [oFilter]);
        
            oBinding.requestContexts(0, 1).then(aContexts => {
                if (aContexts.length === 0) {
                    sap.m.MessageBox.error("Employee not found.");
                    oView.byId("employeeName").setValue("");
                    return;
                }
        
                const oEmployee = aContexts[0].getObject();
                oView.byId("employeeName").setValue(oEmployee.employeeName);
            }).catch(err => {
                console.error("Error fetching employee:", err);
                sap.m.MessageBox.error("Error while searching employee.");
            });
        },
        onClearEmployeeName: function () {
          this.getView().byId("employeeName").setValue("");
      },
      onClaimTypeSelected: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        const sClaimType = oSelectedItem ? oSelectedItem.getText() : null;
    
        if (!sClaimType) {
            return;
        }
    
        const oView = this.getView();
        const oModel = oView.getModel(); 
    
        const oFilter = new Filter("claimType", FilterOperator.EQ, sClaimType);
        const oBinding = oModel.bindList("/ClaimDetails", undefined, undefined, [oFilter]);
    
        oBinding.requestContexts(0, 1).then(aContexts => {
            if (aContexts.length === 0) {
                sap.m.MessageBox.error("Claim details not found.");
                oView.byId("claimCategory").setValue("");
                oView.byId("claimFees").setValue("");
                oView.byId("validityDate").setDateValue(null);
                return;
            }
    
            const oClaim = aContexts[0].getObject();
            oView.byId("claimCategory").setValue(oClaim.claimCategory);
            oView.byId("claimFees").setValue(oClaim.claimFees);
            oView.byId("validityDate").setDateValue(new Date(oClaim.procedureValidityDate));
        }).catch(err => {
            console.error("Error fetching claim details:", err);
            sap.m.MessageBox.error("Error while retrieving claim details.");
        });
    }
    
              
    
  
    
    });
  });