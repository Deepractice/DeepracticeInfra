/**
 * Cucumber-compatible DataTable class
 * Provides methods for accessing step data tables in different formats
 */
export class DataTable {
  private readonly rawRows: string[][];

  constructor(rows: string[][]) {
    this.rawRows = rows;
  }

  /**
   * Return raw rows as-is
   */
  public raw(): string[][] {
    return this.rawRows;
  }

  /**
   * Alias for raw() - for Cucumber compatibility
   */
  public rows(): string[][] {
    return this.raw();
  }

  /**
   * Convert two-column table to key-value object
   * First column becomes keys, second column becomes values
   * Example:
   *   | key1 | value1 |
   *   | key2 | value2 |
   * Returns: { key1: 'value1', key2: 'value2' }
   */
  public rowsHash(): Record<string, string> {
    const result: Record<string, string> = {};

    for (const row of this.rawRows) {
      if (row.length !== 2) {
        throw new Error(
          `rowsHash requires exactly 2 columns per row, but got ${row.length}`,
        );
      }
      const key = row[0];
      const value = row[1];
      if (key !== undefined) {
        result[key] = value || "";
      }
    }

    return result;
  }

  /**
   * Treat first row as headers, remaining rows as data objects
   * Example:
   *   | name  | age |
   *   | Alice | 30  |
   *   | Bob   | 25  |
   * Returns: [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
   */
  public hashes(): Record<string, string>[] {
    if (this.rawRows.length === 0) {
      return [];
    }

    const headers = this.rawRows[0];
    if (!headers) {
      return [];
    }

    const result: Record<string, string>[] = [];

    for (let i = 1; i < this.rawRows.length; i++) {
      const row = this.rawRows[i];
      if (!row) continue;

      const obj: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header !== undefined) {
          obj[header] = row[j] || "";
        }
      }

      result.push(obj);
    }

    return result;
  }
}
