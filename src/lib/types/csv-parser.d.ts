declare module 'csv-parser' {
    import { Readable } from 'stream';
  
    interface CsvParserOptions {
      separator?: string;
      newline?: string;
      quote?: string;
      escape?: string;
      headers?: string[] | boolean;
      mapHeaders?: ({ header, index }: { header: string; index: number }) => string | null;
      mapValues?: ({ header, index, value }: { header: string; index: number; value: string }) => string;
      strict?: boolean;
    }
  
    function csvParser(options?: CsvParserOptions): Readable;
  
    export = csvParser;
  }