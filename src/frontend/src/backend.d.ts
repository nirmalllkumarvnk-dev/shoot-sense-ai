import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PoseIdeaPublic {
    id: PoseId;
    difficulty: Difficulty;
    name: string;
    tags: Array<string>;
    description: string;
    isFavorite: boolean;
    savedAt: Timestamp;
}
export interface ShootPlanPublic {
    id: PlanId;
    poseIds: Array<PoseId>;
    scheduledDate?: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    notes: string;
    location: string;
    shotList: Array<string>;
}
export interface UserProfilePublic {
    displayName: string;
    userId: UserId;
    createdAt: Timestamp;
    photoCount: bigint;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = Principal;
export interface http_header {
    value: string;
    name: string;
}
export type MessageId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ChatMessage {
    id: MessageId;
    content: string;
    role: Role;
    timestamp: Timestamp;
}
export type PoseId = bigint;
export type PlanId = bigint;
export enum Difficulty {
    advanced = "advanced",
    easy = "easy",
    medium = "medium"
}
export enum Role {
    user = "user",
    assistant = "assistant"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChatMessage(role: string, content: string): Promise<ChatMessage>;
    askAI(prompt: string, history: Array<[string, string]>): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearChatHistory(): Promise<boolean>;
    createPose(name: string, description: string, difficulty: Difficulty, tags: Array<string>): Promise<PoseIdeaPublic>;
    createShootPlan(name: string, location: string, scheduledDate: string | null, poseIds: Array<PoseId>, notes: string): Promise<ShootPlanPublic>;
    deletePose(id: PoseId): Promise<boolean>;
    deleteShootPlan(id: PlanId): Promise<boolean>;
    duplicateShootPlan(id: PlanId, newName: string): Promise<ShootPlanPublic | null>;
    favoritePose(id: PoseId): Promise<boolean>;
    generatePoseIdeas(theme: string, count: bigint): Promise<string>;
    generateShootPlan(planName: string, location: string, poseNames: Array<string>): Promise<string>;
    getCallerUserProfile(): Promise<UserProfilePublic | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getPoses(): Promise<Array<PoseIdeaPublic>>;
    getProfile(): Promise<UserProfilePublic | null>;
    getShootPlan(id: PlanId): Promise<ShootPlanPublic | null>;
    getShootPlans(): Promise<Array<ShootPlanPublic>>;
    getUserProfile(user: Principal): Promise<UserProfilePublic | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(displayName: string): Promise<void>;
    setOpenAIKey(apiKey: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePose(id: PoseId, name: string, description: string, difficulty: Difficulty, tags: Array<string>): Promise<PoseIdeaPublic | null>;
    updateProfile(displayName: string): Promise<UserProfilePublic>;
    updateShootPlan(id: PlanId, name: string, location: string, scheduledDate: string | null, poseIds: Array<PoseId>, shotList: Array<string>, notes: string): Promise<ShootPlanPublic | null>;
}
