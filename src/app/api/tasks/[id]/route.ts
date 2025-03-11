import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/lib/models/task";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const task = await Task.findById(params.id);

        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error("Error fetching task:", error);
        return NextResponse.json({ message: "Failed to fetch task" }, { status: 500 });
    }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try{
        await connectToDatabase();
        console.log(params.id);
        await Task.findByIdAndDelete(params.id);
        return NextResponse.json({ message: "Task deleted" }, { status: 200 });
    }
    catch(error){
        return NextResponse.json({ message: "Failed to delete task" }, { status: 500 });
    }
    
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const taskId = params.id;
        const taskUpdates = await req.json();

        const updatedTask = await Task.findByIdAndUpdate(taskId, taskUpdates, { new: true });

        if (!updatedTask) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ message: "Failed to update task" }, { status: 500 });
    }
}


