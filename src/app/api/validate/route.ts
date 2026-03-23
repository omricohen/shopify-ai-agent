import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { storeUrl, accessToken } = await req.json();

    if (!storeUrl || !accessToken) {
      return NextResponse.json(
        { valid: false, error: "Store URL and access token are required." },
        { status: 400 }
      );
    }

    const normalizedUrl = storeUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    const shopDomain = normalizedUrl.includes(".myshopify.com")
      ? normalizedUrl
      : `${normalizedUrl}.myshopify.com`;

    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "Invalid credentials. Please check your store URL and access token." },
        { status: 401 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      valid: true,
      storeUrl: shopDomain,
      shopName: data.shop?.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || "Connection failed." },
      { status: 500 }
    );
  }
}
