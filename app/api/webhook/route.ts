import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received webhook callback:", JSON.stringify(payload, null, 2));

    // TODO: Process the callback payload (e.g., update track status, store audio URL)
    // Example: Check for taskId and audio_url
    if (payload.taskId && payload.audio_url) {
      // Update your database or state with the audio URL
      console.log(`Task ${payload.taskId} completed with audio URL: ${payload.audio_url}`);
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}