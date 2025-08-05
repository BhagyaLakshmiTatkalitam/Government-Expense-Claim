namespace gov.track.db;
using {managed} from '@sap/cds/common';
entity Claims:managed {
    key claimID               : UUID;
        createdOn             : Timestamp;
        requesterID           : String;
        
        requesterName:String;
        claimType             : String;
        totalAmount           : Decimal(10, 2);
        noOfEmployees         : Integer;
        status                : String;
        claimCategory         : String;
        claimFees             : Decimal(10, 2);
        procedureValidityDate : Date;
        employeeDetails             : Association to many EmployeeDetails
                                    on employeeDetails.claim = $self;
        summaries             : Association to ClaimSummary;
        remarks               : Association to Remarks;
        attachments           : Association to many Attachments
                                    on attachments.claim = $self;
}

entity Employees {
    key ID           : UUID;
        employeeID   : String;
        employeeName : String;
        status       : String;
        payGrade     : String;
        action       : String;
        

}


entity Remarks {
    key ID                    : UUID;
        managerRemarks        : String;
        managerManagerRemarks : String;
        financeRemarks        : String;


}

entity Attachments {
    key ID         : UUID;
        fileName   : String;
        uploadedOn : Timestamp;
        uploadedBy : String;
        claim      : Association to Claims;
}

entity ClaimSummary {
    key ID        : UUID;
        claim     : Association to Claims;
        claimType : String;
        empCount  : Integer;
        amount    : Decimal(10, 2);
}
entity ClaimDetails {
    key ID:UUID;
    claimType:String;
    claimCategory:String;
    claimFees:Integer;
    procedureValidityDate:Date;
    
}
entity EmployeeDetails{
    key ID           : UUID;
        employeeIDDetail   : String;
        employeeNameDetail : String;
        statusDetail       : String;
        payGradeDetail     : String;
        actionDetail      : String;
        claim        : Association to Claims;


}
