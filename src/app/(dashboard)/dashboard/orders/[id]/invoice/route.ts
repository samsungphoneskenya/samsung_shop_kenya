import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, opts?: { size?: number; bold?: boolean; x?: number }) => {
    const size = opts?.size ?? 11;
    const x = opts?.x ?? margin;
    page.drawText(text, {
      x,
      y,
      size,
      font: opts?.bold ? fontBold : fontRegular,
      color: rgb(0, 0, 0),
      maxWidth: width - margin * 2,
    });
    y -= size + 6;
  };

  const drawDivider = () => {
    y -= 4;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 14;
  };

  // Header
  page.drawText("Invoice", {
    x: width - margin - fontBold.widthOfTextAtSize("Invoice", 20),
    y,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 28;

  drawText("Samsung Shop Kenya", { size: 10, bold: true });
  drawText("Dashboard order invoice", { size: 10 });
  drawDivider();

  // Order info
  drawText(`Order number: ${order.order_number}`, { bold: true });
  drawText(
    `Order date: ${
      order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"
    }`
  );
  drawText(`Payment method: ${order.payment_method}`);
  drawText(`Payment status: ${order.payment_status || "pending"}`);
  if (order.payment_reference) {
    drawText(`M-Pesa reference: ${order.payment_reference}`);
  }
  drawDivider();

  // Customer & delivery
  drawText("Bill to:", { bold: true });
  drawText(order.customer_name);
  drawText(order.customer_phone);
  if (order.customer_email) drawText(order.customer_email);

  y -= 6;
  drawText("Delivery:", { bold: true });
  drawText(order.delivery_location);
  if (order.delivery_notes) drawText(order.delivery_notes);
  drawDivider();

  // Items
  if (items && items.length > 0) {
    drawText("Items", { bold: true });
    y -= 4;
    for (const item of items) {
      const left = `${item.product_title}`;
      const right = `x${item.quantity} @ KSh ${Number(item.unit_price).toLocaleString()}`;
      const rightWidth = fontRegular.widthOfTextAtSize(right, 10);

      page.drawText(left, {
        x: margin,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0, 0, 0),
        maxWidth: width - margin * 2 - rightWidth - 10,
      });
      page.drawText(right, {
        x: width - margin - rightWidth,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      y -= 16;
    }
    drawDivider();
  }

  // Totals
  const drawRight = (label: string, value: string, bold?: boolean) => {
    const text = `${label}: ${value}`;
    const size = bold ? 12 : 11;
    const font = bold ? fontBold : fontRegular;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: width - margin - textWidth,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= size + 6;
  };

  drawRight("Subtotal", `KSh ${Number(order.subtotal).toLocaleString()}`);
  if (Number(order.tax_amount || 0) > 0) {
    drawRight("Tax", `KSh ${Number(order.tax_amount || 0).toLocaleString()}`);
  }
  if (Number(order.shipping_fee || 0) > 0) {
    drawRight(
      "Shipping",
      `KSh ${Number(order.shipping_fee || 0).toLocaleString()}`
    );
  }
  drawRight("Total", `KSh ${Number(order.total).toLocaleString()}`, true);

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`,
    },
  });
}

