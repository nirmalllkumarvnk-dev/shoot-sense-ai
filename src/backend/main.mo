import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import ProfileTypes "types/profile";
import PoseTypes "types/pose";
import ShootTypes "types/shoot";
import ChatTypes "types/chat";
import Common "types/common";
import ProfileMixin "mixins/profile-api";
import PoseMixin "mixins/pose-api";
import ShootMixin "mixins/shoot-api";
import ChatMixin "mixins/chat-api";
import AIMixin "mixins/ai-api";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Profile state
  let profiles = Map.empty<Common.UserId, ProfileTypes.UserProfile>();
  include ProfileMixin(accessControlState, profiles);

  // Pose library state
  let poses = Map.empty<Common.UserId, List.List<PoseTypes.PoseIdea>>();
  let nextPoseIdRef = { var val : Nat = 0 };
  include PoseMixin(accessControlState, poses, nextPoseIdRef);

  // Shoot plan state
  let shootPlans = Map.empty<Common.UserId, List.List<ShootTypes.ShootPlan>>();
  let nextPlanIdRef = { var val : Nat = 0 };
  include ShootMixin(accessControlState, shootPlans, nextPlanIdRef);

  // Chat history state
  let chatHistory = Map.empty<Common.UserId, List.List<ChatTypes.ChatMessage>>();
  let nextMessageIdRef = { var val : Nat = 0 };
  include ChatMixin(accessControlState, chatHistory, nextMessageIdRef);

  // AI HTTP outcalls
  include AIMixin(accessControlState);
};
