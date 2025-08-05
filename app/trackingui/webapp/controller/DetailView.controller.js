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
      _ExpenseDetailMatched:function(oEvent){
        //this.getOwnerComponent().getModel("ExpenseClaimModel").setProperty("/employeeName","Bhagya lakshmi")
        
            const oLocalModel = this.getOwnerComponent().getModel("ExpenseClaimModel");
            const oEditable = oLocalModel.getProperty("/editable");
            const oView = this.getView();
        
            oView.byId("employeeNumber").setEditable(oEditable);
            oView.byId("claimType").setEditable(oEditable);
            oView.byId("claimCategory").setEditable(oEditable);
            oView.byId("claimFees").setEditable(oEditable);
            oView.byId("validityDate").setEnabled(oEditable);
        
            oView.byId("SimpleFormDisplayColumn_twoGroups234").setEditable(oEditable);
            
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
    },
    onCalculate: function () {
      const oView = this.getView();
      const oExpenseModel = oView.getModel("ExpenseClaimModel");
      
      // Get claim type from dropdown
      const oClaimTypeCombo = oView.byId("claimType");
      const sClaimType = oClaimTypeCombo.getSelectedItem() ? 
                        oClaimTypeCombo.getSelectedItem().getText() : "";
      
      // Get claim fees from input field
      const oClaimFeesInput = oView.byId("claimFees");
      const sClaimFees = oClaimFeesInput.getValue();
      const fClaimFees = parseFloat(sClaimFees) || 0;
      
      // Get employees from local model and count valid entries
      const aEmployees = oExpenseModel.getProperty("/localEmployees") || [];
      const iEmployeeCount = aEmployees.filter(emp => 
          emp.employeeID && emp.employeeID.trim() !== ""
      ).length;
      
      // Calculate total amount
      const fTotalAmount = fClaimFees * iEmployeeCount;
      
      // Validate required fields
      if (!sClaimType) {
          sap.m.MessageBox.error("Please select a Claim Type first.");
          return;
      }
      
      if (fClaimFees <= 0) {
          sap.m.MessageBox.error("Please enter valid Claim Fees.");
          return;
      }
      
      if (iEmployeeCount === 0) {
          sap.m.MessageBox.error("Please add at least one employee with valid Employee ID.");
          return;
      }
      
      //  claim summary data
      const oClaimSummary = {
          claimType: sClaimType,
          empCount: iEmployeeCount,
          amount: fTotalAmount.toFixed(2)
      };
      
      // Set the claim summary in the model
      oExpenseModel.setProperty("/claimSummary", [oClaimSummary]);

      oExpenseModel.updateBindings(true);
      sap.m.MessageToast.show(`Calculation completed: ${iEmployeeCount} employees, Total: ${fTotalAmount.toFixed(2)}`);
  },

//   onSubmit: async function () {
//     const oView = this.getView();
//     const oModel = oView.getModel(); // Main OData V4 model
//     const oLocalModel = this.getView().getModel("ExpenseClaimModel");

//     // Gather input values
//     const sEmployeeID = oView.byId("employeeNumber").getValue();
//     const sEmployeeName = oView.byId("employeeName").getValue();
//     const sClaimType = oView.byId("claimType").getSelectedKey();
//     const sClaimCategory = oView.byId("claimCategory").getValue();
//     const fClaimFees = parseFloat(oView.byId("claimFees").getValue());
//     let myDate = new Date(oView.byId("validityDate").getDateValue());
//     let formattedDate = new Intl.DateTimeFormat('en-CA').format(myDate);

//     const sManagerRemarks = oView.byId("employee").getValue();
//     const sManagerManagerRemarks = oView.byId("employee2").getValue();
//     const sFinanceRemarks = oView.byId("employee1").getValue();

//     const aEmployees = oLocalModel.getProperty("/localEmployees") || [];
//     const aSummary = oLocalModel.getProperty("/claimSummary") || [];

//     if (!sEmployeeID || !sClaimType || !sClaimCategory || !fClaimFees || !formattedDate) {
//         sap.m.MessageBox.warning("Please fill all required fields.");
//         return;
//     }

//     // 2. Create Claim
//     const oClaimPayload = {
//         requesterID: sEmployeeID,
//         requesterName: sEmployeeName,
//         claimType: sClaimType,
//         claimCategory: sClaimCategory,
//         claimFees: fClaimFees,
//         procedureValidityDate: formattedDate,
//         totalAmount: aSummary[0]?.amount || 0,
//         noOfEmployees: aSummary[0]?.empCount || aEmployees.length,
//         status: "Submitted"
//     };

//     try {
//         const oClaimBinding = oModel.bindList("/Claims");
//         const oCreatedClaim = await oClaimBinding.create(oClaimPayload).requestObject();
//         const sClaimID = oCreatedClaim.claimID;

//         //remarks
//         const oRemarksBinding = oModel.bindList("/Remarks");
//         await oRemarksBinding.create({
//             claim_claimID: sClaimID,
//             managerRemarks: sManagerRemarks,
//             managerManagerRemarks: sManagerManagerRemarks,
//             financeRemarks: sFinanceRemarks
//         }).requestObject();

//         //  Create Employees
//         for (let emp of aEmployees) {
//             if (emp.employeeID) { // Only create for valid employee IDs
//                 const oEmpDetailsBinding = oModel.bindList("/EmployeeDetails");
//                 await oEmpDetailsBinding.create({
//                     claim_claimID: sClaimID,
//                     employeeIDDetail: emp.employeeID,
//                     employeeNameDetail: emp.employeeName,
//                     statusDetail: emp.status,
//                     payGradeDetail: emp.payGrade,
//                     actionDetail: emp.action
//                 }).requestObject();
//             }
//         }

//         // Create Claim Summary
//         if (aSummary.length > 0) {
//             const oSummaryBinding = oModel.bindList("/ClaimSummary");
//             await oSummaryBinding.create({
//                 claim_claimID: sClaimID,
//                 claimType: aSummary[0].claimType,
//                 empCount: aSummary[0].empCount,
//                 amount: aSummary[0].amount
//             }).requestObject();
//         }

//         //  Navigate to Home
//         sap.m.MessageToast.show("Claim submitted successfully.");
//         this.getView().getModel().refresh(); 
//         const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//         oRouter.navTo("RouteHomeView"); 

//     } catch (oError) {
//         console.error("Submission failed:", oError);
//         sap.m.MessageBox.error("Failed to submit claim. Please try again.");
//     }
// }
onCompleteLater: async function () {
    await this._submitClaim("Draft");
},
onSubmit: async function () {
    await this._submitClaim("Submitted");
},

_submitClaim: async function (status) {
    const oView = this.getView();
    const oModel = oView.getModel();
    const oLocalModel = oView.getModel("ExpenseClaimModel");

    const sEmployeeID = oView.byId("employeeNumber").getValue();
    const sEmployeeName = oView.byId("employeeName").getValue();
    const sClaimType = oView.byId("claimType").getSelectedKey();
    const sClaimCategory = oView.byId("claimCategory").getValue();
    const fClaimFees = parseFloat(oView.byId("claimFees").getValue()) || 0;
    const formattedDate = new Intl.DateTimeFormat('en-CA').format(oView.byId("validityDate").getDateValue());

    const sManagerRemarks = oView.byId("employee").getValue();
    const sManagerManagerRemarks = oView.byId("employee2").getValue();
    const sFinanceRemarks = oView.byId("employee1").getValue();

    const aEmployees = oLocalModel.getProperty("/localEmployees") || [];
    const aSummary = oLocalModel.getProperty("/claimSummary") || [];

    if (!sEmployeeID || !sClaimType || !sClaimCategory || !fClaimFees || !formattedDate) {
        return sap.m.MessageBox.warning("Please fill all required fields.");
    }

    try {
        const oClaimPayload = {
            requesterID: sEmployeeID,
            requesterName: sEmployeeName,
            claimType: sClaimType,
            claimCategory: sClaimCategory,
            claimFees: fClaimFees,
            procedureValidityDate: formattedDate,
            totalAmount: aSummary[0]?.amount || 0,
            noOfEmployees: aSummary[0]?.empCount || aEmployees.length,
            status
        };

        const oCreatedClaim = await oModel.bindList("/Claims").create(oClaimPayload).requestObject();
        const sClaimID = oCreatedClaim.claimID;

        await oModel.bindList("/Remarks").create({
            claim_claimID: sClaimID,
            managerRemarks: sManagerRemarks,
            managerManagerRemarks: sManagerManagerRemarks,
            financeRemarks: sFinanceRemarks
        }).requestObject();

        for (let emp of aEmployees) {
            if (emp.employeeID) {
                await oModel.bindList("/EmployeeDetails").create({
                    claim_claimID: sClaimID,
                    employeeIDDetail: emp.employeeID,
                    employeeNameDetail: emp.employeeName,
                    statusDetail: emp.status,
                    payGradeDetail: emp.payGrade,
                    actionDetail: emp.action
                }).requestObject();
            }
        }

        if (aSummary.length) {
            await oModel.bindList("/ClaimSummary").create({
                claim_claimID: sClaimID,
                claimType: aSummary[0].claimType,
                empCount: aSummary[0].empCount,
                amount: aSummary[0].amount
            }).requestObject();
        }

        sap.m.MessageToast.show(status === "Submitted" ? "Claim submitted." : "Draft saved.");
        oModel.refresh();
        this.getOwnerComponent().getRouter().navTo("RouteHomeView");

    } catch (err) {
        console.error("Save failed:", err);
        sap.m.MessageBox.error("Error occurred during submission.");
    }
}

   
  
    
    });
  });
