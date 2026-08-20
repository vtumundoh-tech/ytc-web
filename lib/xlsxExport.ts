import ExcelJS from "exceljs";

export type XlsxColumn = {
  header: string;
  key: string;
  width: number;
  numFmt?: string;
};

export async function buildXlsxBuffer(
  sheetName: string,
  columns: XlsxColumn[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "MineClip Studio";
  wb.created = new Date();
  const ws = wb.addWorksheet(sheetName);

  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const headerRow = ws.getRow(1);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { bottom: { style: "thin", color: { argb: "FF374151" } } };
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];

  rows.forEach((r) => {
    const row = ws.addRow(r);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const col = columns[colNumber - 1];
      if (col?.numFmt) cell.numFmt = col.numFmt;
      cell.alignment = { vertical: "top", wrapText: col ? col.width >= 18 : false };
    });
  });

  if (rows.length > 0) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: rows.length + 1, column: columns.length },
    };
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}