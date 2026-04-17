import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProfileLib "../lib/profile";
import ProfileTypes "../types/profile";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, ProfileTypes.UserProfile>,
) {
  public query ({ caller }) func getProfile() : async ?ProfileTypes.UserProfilePublic {
    ProfileLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func updateProfile(displayName : Text) : async ProfileTypes.UserProfilePublic {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.updateProfile(profiles, caller, displayName);
  };

  // Required by authorization extension
  public query ({ caller }) func getCallerUserProfile() : async ?ProfileTypes.UserProfilePublic {
    ProfileLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ignore ProfileLib.updateProfile(profiles, caller, displayName);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?ProfileTypes.UserProfilePublic {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    ProfileLib.getProfile(profiles, user);
  };
};
