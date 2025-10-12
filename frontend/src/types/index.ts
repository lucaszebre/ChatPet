export type ChatThread = {
  branchParent: string | null;
  createdAt: number;
  generationStatus: GenerationStatus;
  lastMessageAt: number;
  model: string;
  pinned: boolean;
  threadId: string;
  title: string;
  updatedAt: number;
  userId: string;
  userSetTitle: boolean;
  visibility: ThreadVisibility;
  _creationTime: number;
  _id: string;
};

export type GenerationStatus = "pending" | "completed" | "failed" | "cancelled";
export type ThreadVisibility = "visible" | "hidden" | "private";

export type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export type ChatType = {
  id: string;
  userId: string;
  histories: ChatMessage[];
  createdAt: Date;
  updateAt: Date;
  name: string;
  isLoading?: boolean;
};
