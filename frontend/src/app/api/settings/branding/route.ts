import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

const BRANDING_KEY = "site_logo";

export async function GET() {
  try {
    const settings = await db.orm.public.SiteSetting
      .where({
        key: BRANDING_KEY,
      })
      .all();

    const setting = settings[0] ?? null;

    return NextResponse.json(
      {
        success: true,
        logo: setting?.value ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Get public branding error:", error);

    return NextResponse.json(
      {
        success: false,
        logo: null,
      },
      { status: 500 }
    );
  }
}