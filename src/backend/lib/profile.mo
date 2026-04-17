import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/profile";
import Common "../types/common";

module {
  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Principal,
  ) : ?Types.UserProfilePublic {
    switch (profiles.get(caller)) {
      case (?p) ?toPublic(p);
      case null null;
    };
  };

  public func createProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Principal,
    displayName : Text,
  ) : Types.UserProfilePublic {
    let profile : Types.UserProfile = {
      userId = caller;
      displayName;
      createdAt = Time.now();
      var photoCount = 0;
    };
    profiles.add(caller, profile);
    toPublic(profile);
  };

  public func updateProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Principal,
    displayName : Text,
  ) : Types.UserProfilePublic {
    switch (profiles.get(caller)) {
      case (?p) {
        let updated : Types.UserProfile = {
          userId = p.userId;
          displayName;
          createdAt = p.createdAt;
          var photoCount = p.photoCount;
        };
        profiles.add(caller, updated);
        toPublic(updated);
      };
      case null {
        createProfile(profiles, caller, displayName);
      };
    };
  };

  public func toPublic(p : Types.UserProfile) : Types.UserProfilePublic {
    {
      userId = p.userId;
      displayName = p.displayName;
      createdAt = p.createdAt;
      photoCount = p.photoCount;
    };
  };
};
