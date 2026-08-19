import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    await adminDb.listCollections();

    return NextResponse.json({
      success: true,
      service: "firebase-admin",
      status: "connected",
    });
  } catch (error) {
    console.error("Firebase Admin health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        service: "firebase-admin",
        status: "error",
      },
      { status: 500 }
    );
  }
}