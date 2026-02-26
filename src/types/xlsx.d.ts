declare module "xlsx" {
  export interface WorkSheet {
    [cell: string]: unknown;
  }
  export interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }
  export function read(data: ArrayBuffer | string, opts?: { type: string }): WorkBook;
  export function write(workbook: WorkBook, opts: { bookType: string; type: string }): number[] | ArrayBuffer;
  export const utils: {
    sheet_to_json<T>(sheet: WorkSheet, opts?: { header: number }): T[];
    aoa_to_sheet(data: unknown[][]): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(workbook: WorkBook, sheet: WorkSheet, name: string): void;
  };
}
