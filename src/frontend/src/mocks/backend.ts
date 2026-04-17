import type { backendInterface, ChatMessage, PoseIdeaPublic, ShootPlanPublic, UserProfilePublic } from "../backend";
import { Difficulty, Role, UserRole } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockUserId = Principal.anonymous();

const mockProfile: UserProfilePublic = {
  displayName: "Alex Chen",
  userId: mockUserId,
  createdAt: BigInt(Date.now()) * BigInt(1000000),
  photoCount: BigInt(42),
};

const mockPoses: PoseIdeaPublic[] = [
  {
    id: BigInt(1),
    name: "Silhouette at Sunset",
    description: "Stand against a bright background, arms slightly away from body for a dramatic silhouette shot.",
    difficulty: Difficulty.easy,
    tags: ["outdoor", "sunset", "silhouette"],
    isFavorite: true,
    savedAt: BigInt(Date.now()) * BigInt(1000000),
  },
  {
    id: BigInt(2),
    name: "Urban Explorer",
    description: "Crouch low with camera angled upward capturing cityscape in the background. Adds depth and scale.",
    difficulty: Difficulty.medium,
    tags: ["urban", "cityscape", "dynamic"],
    isFavorite: false,
    savedAt: BigInt(Date.now()) * BigInt(1000000),
  },
  {
    id: BigInt(3),
    name: "Levitation Shot",
    description: "Jump mid-air with arms extended. Requires fast shutter speed and good timing.",
    difficulty: Difficulty.advanced,
    tags: ["action", "creative", "levitation"],
    isFavorite: true,
    savedAt: BigInt(Date.now()) * BigInt(1000000),
  },
];

const mockShootPlans: ShootPlanPublic[] = [
  {
    id: BigInt(1),
    name: "Downtown Night Shoot",
    location: "Marina Bay, Singapore",
    scheduledDate: "2026-05-15",
    poseIds: [BigInt(1), BigInt(2)],
    notes: "Bring wide-angle lens, arrive at golden hour",
    shotList: ["Skyline reflection", "Neon signs closeup", "Street portrait"],
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
  },
  {
    id: BigInt(2),
    name: "Forest Portraits",
    location: "MacRitchie Reservoir",
    scheduledDate: "2026-05-22",
    poseIds: [BigInt(3)],
    notes: "Morning shoot for soft light, bring reflector",
    shotList: ["Environmental portrait", "Close-up foliage", "Walking shot"],
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
  },
];

const mockChatHistory: ChatMessage[] = [
  {
    id: BigInt(1),
    role: Role.user,
    content: "What's the best time for outdoor portrait photography?",
    timestamp: BigInt(Date.now() - 60000) * BigInt(1000000),
  },
  {
    id: BigInt(2),
    role: Role.assistant,
    content: "The golden hour — about 1 hour after sunrise or 1 hour before sunset — gives you warm, soft, directional light that flatters skin tones and creates beautiful long shadows. For overcast days, the diffused light is also excellent for portraits anytime.",
    timestamp: BigInt(Date.now() - 30000) * BigInt(1000000),
  },
];

export const mockBackend: backendInterface = {
  _initializeAccessControl: async () => undefined,
  addChatMessage: async (role, content) => ({
    id: BigInt(Date.now()),
    role: role as Role,
    content,
    timestamp: BigInt(Date.now()) * BigInt(1000000),
  }),
  askAI: async (_prompt, _history) =>
    "I recommend starting with natural light — position your subject near a large window for soft, flattering illumination. For outdoor shoots, the golden hour provides the most cinematic results.",
  assignCallerUserRole: async () => undefined,
  clearChatHistory: async () => true,
  createPose: async (name, description, difficulty, tags) => ({
    id: BigInt(Date.now()),
    name,
    description,
    difficulty: difficulty as Difficulty,
    tags,
    isFavorite: false,
    savedAt: BigInt(Date.now()) * BigInt(1000000),
  }),
  createShootPlan: async (name, location, scheduledDate, poseIds, notes) => ({
    id: BigInt(Date.now()),
    name,
    location,
    scheduledDate: scheduledDate ?? undefined,
    poseIds,
    notes,
    shotList: [],
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
  }),
  deletePose: async () => true,
  deleteShootPlan: async () => true,
  duplicateShootPlan: async (_id, newName) => ({
    ...mockShootPlans[0],
    id: BigInt(Date.now()),
    name: newName,
  }),
  favoritePose: async () => true,
  generatePoseIdeas: async () =>
    "1. Reflective Puddle Shot - Have subject stand over puddle for a mirror effect\n2. Frame Within Frame - Use doorways or windows to naturally frame subject\n3. Leading Lines - Use road or path to draw eye toward subject",
  generateShootPlan: async () =>
    "Shoot Plan: Golden Hour Urban Session\n- 17:00 Arrive & scout location\n- 17:30 Wide establishing shots\n- 18:00 Portrait session with golden light\n- 18:30 Silhouette shots\n- 19:00 Blue hour long exposures",
  getCallerUserProfile: async () => mockProfile,
  getCallerUserRole: async () => UserRole.user,
  getChatHistory: async () => mockChatHistory,
  getPoses: async () => mockPoses,
  getProfile: async () => mockProfile,
  getShootPlan: async (id) => mockShootPlans.find((p) => p.id === id) ?? null,
  getShootPlans: async () => mockShootPlans,
  getUserProfile: async () => mockProfile,
  isCallerAdmin: async () => false,
  saveCallerUserProfile: async () => undefined,
  setOpenAIKey: async () => undefined,
  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: input.response.headers,
  }),
  updatePose: async (id, name, description, difficulty, tags) => ({
    id,
    name,
    description,
    difficulty: difficulty as Difficulty,
    tags,
    isFavorite: false,
    savedAt: BigInt(Date.now()) * BigInt(1000000),
  }),
  updateProfile: async (_displayName) => mockProfile,
  updateShootPlan: async (id, name, location, scheduledDate, poseIds, shotList, notes) => ({
    id,
    name,
    location,
    scheduledDate: scheduledDate ?? undefined,
    poseIds,
    shotList,
    notes,
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
  }),
};
