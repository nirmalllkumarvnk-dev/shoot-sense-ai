import Common "common";

module {
  public type ShootPlan = {
    id : Common.PlanId;
    var name : Text;
    var location : Text;
    var scheduledDate : ?Text;
    var poseIds : [Common.PoseId];
    var shotList : [Text];
    var notes : Text;
    createdAt : Common.Timestamp;
    var updatedAt : Common.Timestamp;
  };

  // Shared (API boundary) version — no var fields
  public type ShootPlanPublic = {
    id : Common.PlanId;
    name : Text;
    location : Text;
    scheduledDate : ?Text;
    poseIds : [Common.PoseId];
    shotList : [Text];
    notes : Text;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };
};
