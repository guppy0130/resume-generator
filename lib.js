const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const sass = require('node-sass');
const yaml = require('yaml');
const fs = require('fs').promises;
const { readFileSync, statSync } = require('fs');
const path = require('path');

/**
 * Parse `argv.data` as YAML, and return elements tagged with `argv.tag`
 * @param {Object} argv - argv object from yargs
 * @returns {Object} argv.data as an object, filtered by TAG
 */
const getYaml = async (argv) => {
    const stat = statSync(argv.data);
    let allData = {};
    if (stat.isFile()) {
        const yamlInput = await fs.readFile(argv.data, 'utf8');
        Object.assign(allData, yaml.parse(yamlInput));
    } else if (stat.isDirectory()) {
        // read all files in dir, combine objects together
        const fileList = await fs.readdir(argv.data);
        for (const file of fileList) {
            const yamlInput = await fs.readFile(path.join(argv.data, file), 'utf8');
            Object.assign(allData, yaml.parse(yamlInput));
        }
    }
    if (argv.tag) {
        allData = filterObj(allData, argv.tag);
    }
    allData['position'] = argv.tag;
    return allData;
};

/**
 * Filter `elem` for elements with `tag`.
 * @param {Object} elem - object to filter
 * @param {string} tag - tag to filter by
 * @returns {Object} `elem` deep filtered by `tag`
 */
const filterObj = (elem, tag) => {
    if (Array.isArray(elem)) {
        // if it's an array, you'll need to call this for every elem
        return elem.filter(e => filterObj(e, tag) !== null);
    }
    if (typeof(elem) === 'object' && elem !== null) {
        // an object. filter all tags first
        for (let key in elem) {
            elem[key] = filterObj(elem[key], tag);
        }
        // throw out stuff that don't work
        if (Object.prototype.hasOwnProperty.call(elem, 'tags') && Array.isArray(elem.tags)) {
            // if `elem` is an object and has the tags key
            return elem.tags.includes(tag) ? elem : null;
        }
    }
    return elem;
};

/**
 * compile template with yamlInput
 * @param {Object} input - object containing content to pass to template
 * @param {string} styles - CSS to pass into {{ styles }} element
 * @param {Object} argv - argv object from yargs
 * @returns {string} compiled HTML
 */
const getHbs = async (input, styles, argv) => {
    const data = await fs.readFile(`${argv.template}/base.hbs`, 'utf8');
    return hbs.compile(data)({...input, styles});
};

/**
 * compile styles
 * @param {Object} argv - argv object from yargs
 * @returns {string} compiled CSS
 */
const getStyles = async (argv) => {
    return sass.renderSync({
        file: `${argv.template}/styles.scss`
    }).css.toString();
};

/**
 * Make `content` suitable for rendering
 * @param {string|Array} content - some description, in list or string format
 * @returns {string} HTML to render
 */
const descFixer = (content) => {
    return Array.isArray(content) ? new hbs.SafeString(`<ul><li>${content.join('</li><li>')}</li></ul>`) : content;
};

/**
 * Render `content` as a comma-separated list
 * @param {string|Array} content - some description, in list or string format
 * @returns {string} HTML to render
 */
const stringify = (content) => {
    return Array.isArray(content) ? new hbs.SafeString(content.map(elem => elem.name).join(', ')) : content;
};

const base64Encode = (filePath) => {
    return readFileSync(filePath).toString('base64');
};

/**
 * template out HTML from variety of sources
 * @param {Object} argv - argv object from yargs
 * @returns {string} compiled HTML
 */
const setupHtml = async (argv) => {
    const data = await getYaml(argv);
    const styles = await getStyles(argv);
    hbs.registerHelper('descFixer', descFixer);
    hbs.registerHelper('stringify', stringify);
    hbs.registerHelper('base64Encode', base64Encode);
    return await getHbs(data, styles, argv);
};

/**
 * Renders HTML to PDF
 * @param {string} html - HTML to render
 * @param {Object} argv - argv object from yargs
 */
const render = async (html, argv) => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.setContent(html, {
        waitUntil: 'networkidle2'
    });
    await page.pdf({
        path: argv.output,
        format: 'letter',
        printBackground: true
    });
    await browser.close();
};

/**
 * Renders HTML to file
 * @param {Object} argv - argv object from yargs
 */
const debug = async (html, argv) => {
    return fs.writeFile(argv.output, html);
};

module.exports = {
    setupHtml,
    filterObj,
    render,
    debug
};
