const {
    setupHtml,
    render,
    debug
} = require('./lib');
const path = require('path');

const argv = require('yargs')
    .usage('Usage: $0 -d DATA -t TEMPLATE -o OUTPUT')
    .example('$0 -d content.yml -t templates/aeolyus -o output.pdf', 'fill out template/aeolyus with content.yml and output a PDF to output.pdf')
    .example('$0 -d content.yml -t templates/aeolyus -o output.html', 'fill out template/aeolyus with content.yml and output HTML to output.html')
    .alias('d', 'data')
    .nargs('d', 1)
    .describe('d', 'your data')
    .alias('t', 'template')
    .nargs('t', 1)
    .describe('t', 'the template')
    .alias('o', 'output')
    .nargs('o', 1)
    .describe('o', 'PDF output')
    .alias('g', 'tag')
    .nargs('g', 1)
    .describe('g', 'tag')
    .demandOption(['d', 't', 'o'])
    .help('h')
    .alias('h', 'help')
    .argv;

setupHtml(argv).then(html => {
    switch (path.extname(argv.output)) {
    case '.pdf':
        return render(html, argv);
    case '.html':
        return debug(html, argv);
    default:
        return debug(html, argv);
    }
});
