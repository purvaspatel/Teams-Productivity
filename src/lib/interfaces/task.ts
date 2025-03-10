export interface Task {
    _id: string;
    taskID: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    assignedTo?: {
      avatar: string;
    }[];
  }

