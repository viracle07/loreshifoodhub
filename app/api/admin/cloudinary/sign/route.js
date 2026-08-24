import { NextResponse } from "next/server";

import { cloudinary } from "@/lib/cloudinary";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";

export async function POST(request) {
  try {
    /*
     * Make sure only an authenticated admin
     * can request Cloudinary signatures.
     */
    const admin =
      await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin authentication required.",
        },
        { status: 403 }
      );
    }

    /*
     * next-cloudinary sends:
     *
     * {
     *   paramsToSign: {
     *     ...
     *   }
     * }
     */
    const body =
      await request.json();

    const paramsToSign =
      body?.paramsToSign;

    console.log(
      "Cloudinary params received for signing:",
      paramsToSign
    );

    if (
      !paramsToSign ||
      typeof paramsToSign !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary signing parameters are missing.",
        },
        { status: 400 }
      );
    }

    /*
     * Generate the signature from the
     * EXACT parameters supplied by
     * the Cloudinary widget.
     *
     * Do NOT create our own timestamp.
     * Do NOT manually add/remove parameters.
     */
    const signature =
      cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
      );

    console.log(
      "Cloudinary signature generated successfully."
    );

    /*
     * next-cloudinary expects the
     * generated signature.
     */
    return NextResponse.json({
      signature,
    });
  } catch (error) {
    console.error(
      "Cloudinary signature error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to authorize image upload.",
      },
      { status: 500 }
    );
  }
}