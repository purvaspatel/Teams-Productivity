import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/lib/models/task";

/** Function to get all tasks */
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const tasks = await Task.find({});
        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.log("Error fetching tasks:", error);
        return NextResponse.json({ message: "Failed to fetch tasks" }, { status: 500 });
    }
}

/** Function to create a new task */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();

        // Find last task and increment taskID
        const lastTask = await Task.findOne().sort({ taskID: -1 });
        const newTaskID = lastTask ? lastTask.taskID + 1 : 1;

        const newTask = new Task({ ...body, taskID: newTaskID }); // Assign taskID
        console.log(newTask);
        await newTask.save();

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json({ message: "Failed to create task" }, { status: 500 });
    }
}
