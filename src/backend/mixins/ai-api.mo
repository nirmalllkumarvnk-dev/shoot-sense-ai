import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AILib "../lib/ai";

mixin (
  accessControlState : AccessControl.AccessControlState,
) {
  var openAIApiKey : Text = "";

  public shared ({ caller }) func setOpenAIKey(apiKey : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set the API key");
    };
    openAIApiKey := apiKey;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func askAI(
    prompt : Text,
    history : [(Text, Text)],
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (openAIApiKey == "") {
      Runtime.trap("OpenAI API key not configured");
    };
    let body = AILib.buildAskAIBody(prompt, history);
    let headers = [AILib.getAuthHeader(openAIApiKey), AILib.getContentTypeHeader()];
    await OutCall.httpPostRequest("https://api.openai.com/v1/chat/completions", headers, body, transform);
  };

  public shared ({ caller }) func generatePoseIdeas(
    theme : Text,
    count : Nat,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (openAIApiKey == "") {
      Runtime.trap("OpenAI API key not configured");
    };
    let body = AILib.buildGeneratePoseIdeasBody(theme, count);
    let headers = [AILib.getAuthHeader(openAIApiKey), AILib.getContentTypeHeader()];
    await OutCall.httpPostRequest("https://api.openai.com/v1/chat/completions", headers, body, transform);
  };

  public shared ({ caller }) func generateShootPlan(
    planName : Text,
    location : Text,
    poseNames : [Text],
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (openAIApiKey == "") {
      Runtime.trap("OpenAI API key not configured");
    };
    let body = AILib.buildGenerateShotListBody(planName, location, poseNames);
    let headers = [AILib.getAuthHeader(openAIApiKey), AILib.getContentTypeHeader()];
    await OutCall.httpPostRequest("https://api.openai.com/v1/chat/completions", headers, body, transform);
  };
};
