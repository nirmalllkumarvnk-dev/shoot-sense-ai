import OutCall "mo:caffeineai-http-outcalls/outcall";

module {
  let model = "gpt-4o-mini";

  // Escape a text value for safe embedding in a JSON string
  func jsonEscape(s : Text) : Text {
    var result = s;
    result := result.replace(#char '\\', "\\\\");
    result := result.replace(#char '\u{22}', "\\u{22}");
    result := result.replace(#char '\n', "\\n");
    result := result.replace(#char '\r', "\\r");
    result := result.replace(#char '\t', "\\t");
    result;
  };

  let q = "\u{22}";

  func buildMessages(sysPrompt : Text, userMessages : [(Text, Text)], finalUserMessage : Text) : Text {
    var msgs = "[{" # q # "role" # q # ":" # q # "system" # q # "," # q # "content" # q # ":" # q # jsonEscape(sysPrompt) # q # "}";
    for ((role, content) in userMessages.vals()) {
      msgs #= ",{" # q # "role" # q # ":" # q # jsonEscape(role) # q # "," # q # "content" # q # ":" # q # jsonEscape(content) # q # "}";
    };
    msgs #= ",{" # q # "role" # q # ":" # q # "user" # q # "," # q # "content" # q # ":" # q # jsonEscape(finalUserMessage) # q # "}]";
    msgs;
  };

  func buildRequestBody(messages : Text) : Text {
    "{" # q # "model" # q # ":" # q # model # q # "," # q # "messages" # q # ":" # messages # "," # q # "max_tokens" # q # ":1024}";
  };

  public func buildAskAIBody(prompt : Text, history : [(Text, Text)]) : Text {
    let sysPrompt = "You are SHOOT SENSE AI, an expert photography assistant. You help photographers with creative pose ideas, shoot planning, location scouting, lighting tips, and composition techniques. Be concise, creative, and practical.";
    let messages = buildMessages(sysPrompt, history, prompt);
    buildRequestBody(messages);
  };

  public func buildGeneratePoseIdeasBody(theme : Text, count : Nat) : Text {
    let sysPrompt = "You are a professional photography pose director. Return ONLY a valid JSON array of pose objects. No markdown, no explanation, just the JSON array.";
    let userMsg = "Generate " # count.toText() # " creative photography pose ideas for the theme: " # theme # ". Return a JSON array where each element has: name (string), description (string), difficulty (" # q # "easy" # q # "|" # q # "medium" # q # "|" # q # "advanced" # q # "), tags (array of strings).";
    let messages = buildMessages(sysPrompt, [], userMsg);
    buildRequestBody(messages);
  };

  public func buildGenerateShotListBody(planName : Text, location : Text, poses : [Text]) : Text {
    let sysPrompt = "You are a professional photography shoot planner. Return ONLY a valid JSON array of shot list strings. No markdown, no explanation.";
    let poseList = poses.foldLeft("", func(acc : Text, p : Text) : Text {
      if (acc == "") p else acc # ", " # p
    });
    let userMsg = "Create a detailed shot list for a photography shoot called " # q # planName # q # " at location " # q # location # q # ". The planned poses are: " # poseList # ". Return a JSON array of shot description strings covering setup, lighting, angles, and special considerations.";
    let messages = buildMessages(sysPrompt, [], userMsg);
    buildRequestBody(messages);
  };

  public func getAuthHeader(apiKey : Text) : OutCall.Header {
    { name = "Authorization"; value = "Bearer " # apiKey };
  };

  public func getContentTypeHeader() : OutCall.Header {
    { name = "Content-Type"; value = "application/json" };
  };
};
