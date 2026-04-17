import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/pose";
import Common "../types/common";

module {
  func getUserPoses(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    caller : Principal,
  ) : List.List<Types.PoseIdea> {
    switch (poses.get(caller)) {
      case (?list) list;
      case null {
        let list = List.empty<Types.PoseIdea>();
        poses.add(caller, list);
        list;
      };
    };
  };

  public func savePose(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    nextId : { var val : Nat },
    caller : Principal,
    name : Text,
    description : Text,
    difficulty : Types.Difficulty,
    tags : [Text],
  ) : Types.PoseIdeaPublic {
    let id = nextId.val;
    nextId.val += 1;
    let pose : Types.PoseIdea = {
      id;
      name;
      description;
      difficulty;
      tags;
      savedAt = Time.now();
      var isFavorite = false;
    };
    let list = getUserPoses(poses, caller);
    list.add(pose);
    toPublic(pose);
  };

  public func getPoses(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    caller : Principal,
  ) : [Types.PoseIdeaPublic] {
    let list = getUserPoses(poses, caller);
    list.map<Types.PoseIdea, Types.PoseIdeaPublic>(toPublic).toArray();
  };

  public func updatePose(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    caller : Principal,
    id : Common.PoseId,
    name : Text,
    description : Text,
    difficulty : Types.Difficulty,
    tags : [Text],
  ) : ?Types.PoseIdeaPublic {
    let list = getUserPoses(poses, caller);
    var found : ?Types.PoseIdeaPublic = null;
    list.mapInPlace(
      func(pose) {
        if (pose.id == id) {
          let updated : Types.PoseIdea = {
            id = pose.id;
            name;
            description;
            difficulty;
            tags;
            savedAt = pose.savedAt;
            var isFavorite = pose.isFavorite;
          };
          found := ?toPublic(updated);
          updated;
        } else pose;
      }
    );
    found;
  };

  public func deletePose(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    caller : Principal,
    id : Common.PoseId,
  ) : Bool {
    let list = getUserPoses(poses, caller);
    let sizeBefore = list.size();
    let filtered = list.filter(func(p) { p.id != id });
    list.clear();
    list.append(filtered);
    list.size() < sizeBefore;
  };

  public func favoritePose(
    poses : Map.Map<Common.UserId, List.List<Types.PoseIdea>>,
    caller : Principal,
    id : Common.PoseId,
  ) : Bool {
    let list = getUserPoses(poses, caller);
    var toggled = false;
    list.mapInPlace(
      func(pose) {
        if (pose.id == id) {
          pose.isFavorite := not pose.isFavorite;
          toggled := true;
          pose;
        } else pose;
      }
    );
    toggled;
  };

  public func toPublic(p : Types.PoseIdea) : Types.PoseIdeaPublic {
    {
      id = p.id;
      name = p.name;
      description = p.description;
      difficulty = p.difficulty;
      tags = p.tags;
      savedAt = p.savedAt;
      isFavorite = p.isFavorite;
    };
  };
};
