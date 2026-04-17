import Common "common";

module {
  public type UserProfile = {
    userId : Common.UserId;
    displayName : Text;
    createdAt : Common.Timestamp;
    var photoCount : Nat;
  };

  // Shared (API boundary) version — no var fields
  public type UserProfilePublic = {
    userId : Common.UserId;
    displayName : Text;
    createdAt : Common.Timestamp;
    photoCount : Nat;
  };
};
