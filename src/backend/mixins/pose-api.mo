import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import PoseLib "../lib/pose";
import PoseTypes "../types/pose";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  poses : Map.Map<Common.UserId, List.List<PoseTypes.PoseIdea>>,
  nextPoseId : { var val : Nat },
) {
  public shared ({ caller }) func createPose(
    name : Text,
    description : Text,
    difficulty : PoseTypes.Difficulty,
    tags : [Text],
  ) : async PoseTypes.PoseIdeaPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PoseLib.savePose(poses, nextPoseId, caller, name, description, difficulty, tags);
  };

  public query ({ caller }) func getPoses() : async [PoseTypes.PoseIdeaPublic] {
    PoseLib.getPoses(poses, caller);
  };

  public shared ({ caller }) func updatePose(
    id : Common.PoseId,
    name : Text,
    description : Text,
    difficulty : PoseTypes.Difficulty,
    tags : [Text],
  ) : async ?PoseTypes.PoseIdeaPublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PoseLib.updatePose(poses, caller, id, name, description, difficulty, tags);
  };

  public shared ({ caller }) func deletePose(id : Common.PoseId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PoseLib.deletePose(poses, caller, id);
  };

  public shared ({ caller }) func favoritePose(id : Common.PoseId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    PoseLib.favoritePose(poses, caller, id);
  };
};
