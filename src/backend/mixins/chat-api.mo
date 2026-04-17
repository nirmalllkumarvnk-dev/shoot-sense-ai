import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ChatLib "../lib/chat";
import ChatTypes "../types/chat";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  chatHistory : Map.Map<Common.UserId, List.List<ChatTypes.ChatMessage>>,
  nextMessageId : { var val : Nat },
) {
  public shared ({ caller }) func addChatMessage(
    role : Text,
    content : Text,
  ) : async ChatTypes.ChatMessage {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let typedRole : ChatTypes.Role = if (role == "assistant") #assistant else #user;
    ChatLib.saveChatMessage(chatHistory, nextMessageId, caller, typedRole, content);
  };

  public query ({ caller }) func getChatHistory() : async [ChatTypes.ChatMessage] {
    ChatLib.getChatHistory(chatHistory, caller);
  };

  public shared ({ caller }) func clearChatHistory() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ChatLib.clearChatHistory(chatHistory, caller);
  };
};
