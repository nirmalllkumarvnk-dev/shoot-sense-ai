import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/shoot";
import Common "../types/common";

module {
  func getUserPlans(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    caller : Principal,
  ) : List.List<Types.ShootPlan> {
    switch (plans.get(caller)) {
      case (?list) list;
      case null {
        let list = List.empty<Types.ShootPlan>();
        plans.add(caller, list);
        list;
      };
    };
  };

  public func createShootPlan(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    nextId : { var val : Nat },
    caller : Principal,
    name : Text,
    location : Text,
    scheduledDate : ?Text,
    poseIds : [Common.PoseId],
    notes : Text,
  ) : Types.ShootPlanPublic {
    let id = nextId.val;
    nextId.val += 1;
    let now = Time.now();
    let plan : Types.ShootPlan = {
      id;
      var name;
      var location;
      var scheduledDate;
      var poseIds;
      var shotList = [];
      var notes;
      createdAt = now;
      var updatedAt = now;
    };
    let list = getUserPlans(plans, caller);
    list.add(plan);
    toPublic(plan);
  };

  public func updateShootPlan(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    caller : Principal,
    id : Common.PlanId,
    name : Text,
    location : Text,
    scheduledDate : ?Text,
    poseIds : [Common.PoseId],
    shotList : [Text],
    notes : Text,
  ) : ?Types.ShootPlanPublic {
    let list = getUserPlans(plans, caller);
    var found : ?Types.ShootPlanPublic = null;
    list.mapInPlace(
      func(plan) {
        if (plan.id == id) {
          plan.name := name;
          plan.location := location;
          plan.scheduledDate := scheduledDate;
          plan.poseIds := poseIds;
          plan.shotList := shotList;
          plan.notes := notes;
          plan.updatedAt := Time.now();
          found := ?toPublic(plan);
          plan;
        } else plan;
      }
    );
    found;
  };

  public func getShootPlans(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    caller : Principal,
  ) : [Types.ShootPlanPublic] {
    let list = getUserPlans(plans, caller);
    list.map<Types.ShootPlan, Types.ShootPlanPublic>(toPublic).toArray();
  };

  public func getShootPlan(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    caller : Principal,
    id : Common.PlanId,
  ) : ?Types.ShootPlanPublic {
    let list = getUserPlans(plans, caller);
    switch (list.find(func(p) { p.id == id })) {
      case (?p) ?toPublic(p);
      case null null;
    };
  };

  public func deleteShootPlan(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    caller : Principal,
    id : Common.PlanId,
  ) : Bool {
    let list = getUserPlans(plans, caller);
    let sizeBefore = list.size();
    let filtered = list.filter(func(p) { p.id != id });
    list.clear();
    list.append(filtered);
    list.size() < sizeBefore;
  };

  public func cloneShootPlan(
    plans : Map.Map<Common.UserId, List.List<Types.ShootPlan>>,
    nextId : { var val : Nat },
    caller : Principal,
    id : Common.PlanId,
    newName : Text,
  ) : ?Types.ShootPlanPublic {
    let list = getUserPlans(plans, caller);
    switch (list.find(func(p) { p.id == id })) {
      case (?original) {
        let newId = nextId.val;
        nextId.val += 1;
        let now = Time.now();
        let clone : Types.ShootPlan = {
          id = newId;
          var name = newName;
          var location = original.location;
          var scheduledDate = original.scheduledDate;
          var poseIds = original.poseIds;
          var shotList = original.shotList;
          var notes = original.notes;
          createdAt = now;
          var updatedAt = now;
        };
        list.add(clone);
        ?toPublic(clone);
      };
      case null null;
    };
  };

  public func toPublic(p : Types.ShootPlan) : Types.ShootPlanPublic {
    {
      id = p.id;
      name = p.name;
      location = p.location;
      scheduledDate = p.scheduledDate;
      poseIds = p.poseIds;
      shotList = p.shotList;
      notes = p.notes;
      createdAt = p.createdAt;
      updatedAt = p.updatedAt;
    };
  };
};
