import { setupHtml, renderToPDF, renderToHTML } from './lib';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface Arguments {
  [x: string]: unknown;
  _: unknown;
  data: string;
  template: string;
  output: string;
  position: string | undefined;
}

const options = {
  data: {
    alias: 'd',
    demandOption: true,
    describe: 'your data',
    type: 'string',
    nargs: 1,
  },
  template: {
    alias: 't',
    demandOption: true,
    describe: 'template to use',
    type: 'string',
    nargs: 1,
  },
  output: {
    alias: 'o',
    demandOption: true,
    describe: 'output file (.pdf, .html)',
    type: 'string',
    nargs: 1,
  },
  position: {
    alias: 'p',
    describe: 'position to filter for',
    type: 'string',
    nargs: 1,
  },
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/28061
const argv: Arguments = yargs(hideBin(process.argv))
  .usage('Usage: $0 -d DATA -t TEMPLATE -o OUTPUT')
  .example(
    '$0 -d content.yml -t templates/aeolyus -o output.pdf',
    'fill out template/aeolyus with content.yml and output a PDF to output.pdf'
  )
  .example(
    '$0 -d content.yml -t templates/aeolyus -o output.html',
    'fill out template/aeolyus with content.yml and output HTML to output.html'
  )
  // @ts-ignore
  .options(options)
  .scriptName('index.ts')  // this seems wrong, but it helps with `bun run`
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .parseSync() as unknown as Arguments;

setupHtml(argv).then((html) => {
  switch (path.extname(argv.output)) {
    case '.pdf':
      return renderToPDF(html, argv);
    case '.html':
      return renderToHTML(html, argv);
    default:
      return renderToHTML(html, argv);
  }
});

export { Arguments };
