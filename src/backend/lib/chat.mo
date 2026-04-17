import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/chat";
import Common "../types/common";

module {
  let maxMessages : Nat = 50;

  func getUserHistory(
    history : Map.Map<Common.UserId, List.List<Types.ChatMessage>>,
    caller : Principal,
  ) : List.List<Types.ChatMessage> {
    switch (history.get(caller)) {
      case (?list) list;
      case null {
        let list = List.empty<Types.ChatMessage>();
        history.add(caller, list);
        list;
      };
    };
  };

  public func saveChatMessage(
    history : Map.Map<Common.UserId, List.List<Types.ChatMessage>>,
    nextId : { var val : Nat },
    caller : Principal,
    role : Types.Role,
    content : Text,
  ) : Types.ChatMessage {
    let id = nextId.val;
    nextId.val += 1;
    let msg : Types.ChatMessage = {
      id;
      role;
      content;
      timestamp = Time.now();
    };
    let list = getUserHistory(history, caller);
    list.add(msg);
    // Trim oldest messages — keep only the last maxMessages
    if (list.size() > maxMessages) {
      let startIdx : Int = list.size().toInt() - maxMessages.toInt();
      let recent = List.fromIter<Types.ChatMessage>(list.range(startIdx, list.size().toInt()));
      list.clear();
      list.append(recent);
    };
    msg;
  };

  public func getChatHistory(
    history : Map.Map<Common.UserId, List.List<Types.ChatMessage>>,
    caller : Principal,
  ) : [Types.ChatMessage] {
    let list = getUserHistory(history, caller);
    list.toArray();
  };

  public func clearChatHistory(
    history : Map.Map<Common.UserId, List.List<Types.ChatMessage>>,
    caller : Principal,
  ) : Bool {
    let list = getUserHistory(history, caller);
    list.clear();
    true;
  };
};
