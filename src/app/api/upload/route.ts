import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create unique name to prevent overwrite
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.name);
        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${path.basename(safeName, ext)}-${uniqueSuffix}${ext}`;

        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return the public URL
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            filename: filename
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
