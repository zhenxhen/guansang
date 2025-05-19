/// <reference types="react-scripts" />

// showdown 모듈 타입 선언
declare module 'showdown' {
  export interface ConverterOptions {
    tables?: boolean;
    tasklists?: boolean;
    strikethrough?: boolean;
    simplifiedAutoLink?: boolean;
    parseImgDimensions?: boolean;
    simpleLineBreaks?: boolean;
  }

  export class Converter {
    constructor(options?: ConverterOptions);
    makeHtml(text: string): string;
  }

  const showdown: {
    Converter: typeof Converter;
  };

  export default showdown;
}
