using gov.track.db as db from '../db/schema';
service GovernmentTrackService{
    //entity Items as projection on db.Items;
    entity Claims as projection on db.Claims;
    entity Employees as projection on db.Employees;
    entity Remarks as projection on db.Remarks;
    entity Attachments as projection on db.Attachments;
    entity ClaimSummary as projection on db.ClaimSummary;
    entity ClaimDetails as projection on db.ClaimDetails
}