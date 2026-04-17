import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ShootLib "../lib/shoot";
import ShootTypes "../types/shoot";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  plans : Map.Map<Common.UserId, List.List<ShootTypes.ShootPlan>>,
  nextPlanId : { var val : Nat },
) {
  public shared ({ caller }) func createShootPlan(
    name : Text,
    location : Text,
    scheduledDate : ?Text,
    poseIds : [Common.PoseId],
    notes : Text,
  ) : async ShootTypes.ShootPlanPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ShootLib.createShootPlan(plans, nextPlanId, caller, name, location, scheduledDate, poseIds, notes);
  };

  public shared ({ caller }) func updateShootPlan(
    id : Common.PlanId,
    name : Text,
    location : Text,
    scheduledDate : ?Text,
    poseIds : [Common.PoseId],
    shotList : [Text],
    notes : Text,
  ) : async ?ShootTypes.ShootPlanPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ShootLib.updateShootPlan(plans, caller, id, name, location, scheduledDate, poseIds, shotList, notes);
  };

  public query ({ caller }) func getShootPlans() : async [ShootTypes.ShootPlanPublic] {
    ShootLib.getShootPlans(plans, caller);
  };

  public query ({ caller }) func getShootPlan(id : Common.PlanId) : async ?ShootTypes.ShootPlanPublic {
    ShootLib.getShootPlan(plans, caller, id);
  };

  public shared ({ caller }) func deleteShootPlan(id : Common.PlanId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ShootLib.deleteShootPlan(plans, caller, id);
  };

  public shared ({ caller }) func duplicateShootPlan(id : Common.PlanId, newName : Text) : async ?ShootTypes.ShootPlanPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ShootLib.cloneShootPlan(plans, nextPlanId, caller, id, newName);
  };
};
