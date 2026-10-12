declare module "mammoth/mammoth.browser" {
  export interface MammothResult {
    value: string;
    messages: any[];
  }

  export interface MammothOptions {
    arrayBuffer: ArrayBuffer;
    [key: string]: any;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: any
  ): Promise<MammothResult>;

  const mammoth: {
    convertToHtml: typeof convertToHtml;
  };

  export default mammoth;
}
