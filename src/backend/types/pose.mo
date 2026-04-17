import Common "common";

module {
  public type Difficulty = { #easy; #medium; #advanced };

  public type PoseIdea = {
    id : Common.PoseId;
    name : Text;
    description : Text;
    difficulty : Difficulty;
    tags : [Text];
    savedAt : Common.Timestamp;
    var isFavorite : Bool;
  };

  // Shared (API boundary) version — no var fields
  public type PoseIdeaPublic = {
    id : Common.PoseId;
    name : Text;
    description : Text;
    difficulty : Difficulty;
    tags : [Text];
    savedAt : Common.Timestamp;
    isFavorite : Bool;
  };
};
