declare module "xlsx" {
  export interface WorkSheet {
    [cell: string]: unknown;
  }
  export interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }
  export function read(data: ArrayBuffer | string, opts?: { type: string }): WorkBook;
  export const utils: {
    sheet_to_json<T>(sheet: WorkSheet, opts?: { header: number }): T[];
  };
}
