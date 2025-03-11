import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
  {
    taskID: { type: Number, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "complete", "due"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    category: { type: String, required: true, default: "general" },
    dueDate: { type: Date, required: false },
    createdBy: { type: String, required: true }, 
    assignedTo: [{ type: String }], 
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true }, 
    subtasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    comments: [
      {
        user: { type: String },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

TaskSchema.pre("save", async function (next) {
  if (!this.taskID) {
    const lastTask = await Task.findOne().sort({ taskID: -1 });
    this.taskID = lastTask ? lastTask.taskID + 1 : 1;
  }
  next();
});

const Task = models.Task || model("Task", TaskSchema);
export default Task;
