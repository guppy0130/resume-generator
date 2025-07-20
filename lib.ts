import puppeteer from 'puppeteer';
import hbs from 'handlebars';
import * as sass from 'sass';
import yaml from 'yaml';
import { stat, readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import descFixer from './handlebars/helpers/descFixer';
import stringify from './handlebars/helpers/stringify';
import base64Encode from './handlebars/helpers/base64Encode';
import type { Arguments } from './index';

/**
 * Filterable based on `positions` key
 */
interface FilterableObject {
  /**
   * List of positions this object is relevant to
   */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  positions?: string[] | null;
}

interface GenericNamedObject {
  /**
   * Identifiable name to be rendered in final output
   */
  name: string;
}

/**
 * An object with `name` that is filterable by `position` CLI arg
 */
interface GenericFilterableNamedObject
  extends GenericNamedObject,
    FilterableObject {}
/**
 * Describes education (usually college level and higher)
 */
interface Education {
  /**
   * School name
   */
  name: string;
  /**
   * Major/topic of study
   */
  major: string;
  /**
   * Enrollment start/end dates
   */
  dates: {
    start: number;
    end: number;
  };
  /**
   * List of classes taken
   */
  classes: GenericFilterableNamedObject[];
}

/**
 * Generic resume data
 */
interface ResumeData extends GenericFilterableNamedObject {
  /**
   * Your (full) name
   */
  name: string;
  /**
   * A bit about you
   */
  description: string;
  /**
   * Location you're looking for/where you currently are
   */
  location: {
    city: string;
  };
  /**
   * Contact information
   */
  contact: {
    phone: string;
    email: string;
    website: string;
    github: string;
    linkedin: string;
  };
  /**
   * A list of places you went for education
   * @see{Education}
   */
  education: Education[];
  /**
   * Places you've worked for/obtained experience from
   */
  experience: GenericFilterableNamedObject[];
  /**
   * Personal projects
   */
  projects: GenericFilterableNamedObject[];
  /**
   * Skills? Things you can market
   */
  skills: GenericFilterableNamedObject[];
  /**
   * Current interests
   */
  interests: GenericFilterableNamedObject[];
  /**
   * Filled in by the -p CLI argument
   */
  position?: string;
}

/**
 * Parse `argv.data` as YAML, and return elements tagged with `argv.position`
 * @param {Arguments} argv - argv object from yargs
 * @returns {ResumeData} argv.data as an object, filtered by POSITION
 */
const getYaml = async (argv: Arguments): Promise<ResumeData> => {
  const fileStat = await stat(argv.data);
  // we'll build the object with user-supplied YAML input, so go ahead and type
  // it now
  let resumeData = <ResumeData>{};
  if (fileStat.isFile()) {
    const yamlInput = await readFile(argv.data, { encoding: 'utf8' });
    yaml.parseAllDocuments(yamlInput).forEach((parsedDoc) => {
      // pretty sure this is expensive, but it's convenient
      Object.assign(resumeData, yaml.parse(parsedDoc.toString()));
    });
  } else if (fileStat.isDirectory()) {
    // read all files in dir, combine objects together
    const fileList = await readdir(argv.data);
    for (const file of fileList) {
      // skip non files
      if (!(await stat(path.join(argv.data, file))).isFile()) {
        continue;
      }
      // skip not yaml
      if (!(file.endsWith('yml') || file.endsWith('yaml'))) {
        continue;
      }
      const yamlInput = await readFile(path.join(argv.data, file), 'utf8');
      yaml.parseAllDocuments(yamlInput).forEach((parsedDoc) => {
        // pretty sure this is expensive, but it's convenient
        Object.assign(resumeData, yaml.parse(parsedDoc.toString()));
      });
    }
  }
  if (argv.position) {
    // `as` is used here because this is a filter, but it doesn't delete
    // top-level keys
    resumeData = filterObj(resumeData, argv.position) as ResumeData;
  }
  resumeData['position'] = argv.position;
  return resumeData;
};

type FilterableAny = FilterableObject | FilterableAny[];

/**
 * Filter `elem` for elements with `position`.
 * @param {FilterableAny} elem - object to filter
 * @param {string} position - tag to filter by
 * @returns {FilterableAny | null} `elem` deep-filtered for `position`
 */
const filterObj = (
  elem: FilterableAny,
  position: string
): FilterableAny | null => {
  if (Array.isArray(elem)) {
    // if it's an array, you'll need to call this for every elem
    return elem.map((e) => filterObj(e, position)).filter((e) => e !== null);
  } else if (typeof elem === 'object' && elem !== null) {
    // an object. filter all object properties first, because you need to
    // recurse through keys before returning.
    for (const key in elem) {
      elem[key] = filterObj(elem[key], position);
    }
    // if `elem` is an object and has `position` in `positions` array, return
    // it, otherwise set it null...?
    if (
      Object.prototype.hasOwnProperty.call(elem, 'positions') &&
      Array.isArray(elem.positions)
    ) {
      return elem.positions.includes(position) ? elem : null;
    }
  }
  return elem;
};

/**
 * compile template with yamlInput
 * @param {ResumeData} input - object containing content to pass to template
 * @param {string} styles - CSS to pass into {{ styles }} element
 * @param {Arguments} argv - argv object from yargs
 * @returns {Promise<string>} compiled HTML
 */
const getHbs = async (
  input: ResumeData,
  styles: string,
  argv: Arguments
): Promise<string> => {
  const data_path = path.join(argv.template, 'base.hbs');
  const data = await readFile(data_path, 'utf8');
  return hbs.compile(data)({ ...input, styles });
};

/**
 * compile styles
 * @param {Arguments} argv - argv object from yargs
 * @returns {string} compiled CSS
 */
const getStyles = (argv: Arguments): string => {
  const scss_path = path.join(argv.template, 'styles.scss');
  return sass.compile(scss_path).css.toString();
};

/**
 * Register handlebars helpers
 * @param {Arguments} argv - argv object from yargs
 */
const registerHandlebarsHelpers = async (argv: Arguments) => {
  // either the assets are inside the dir passed in, or it's next to the data
  // file that was passed in, but in either case, use that directory
  const asset_dir = (await stat(argv.data)).isDirectory()
    ? argv.data
    : path.dirname(argv.data);
  // bind the asset_dir to the first arg of base64Encode
  hbs.registerHelper('base64Encode', base64Encode.bind(null, asset_dir));
  hbs.registerHelper('descFixer', descFixer);
  hbs.registerHelper('stringify', stringify);
};

/**
 * template out HTML from variety of sources
 * @param {Arguments} argv - argv object from yargs
 * @returns {Promise<string>} compiled HTML
 */
const setupHtml = async (argv: Arguments): Promise<string> => {
  await registerHandlebarsHelpers(argv);
  const data = await getYaml(argv);
  const styles = getStyles(argv);
  return getHbs(data, styles, argv);
};

/**
 * Renders HTML to PDF
 * @param {string} html - HTML to render
 * @param {Arguments} argv - argv object from yargs
 */
const renderToPDF = async (html: string, argv: Arguments) => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle2',
  });
  await page.pdf({
    path: argv.output,
    format: 'letter',
    printBackground: true,
  });
  await browser.close();
};

/**
 * Renders HTML to file
 * @param {string} html - HTML to render
 * @param {Arguments} argv - argv object from yargs
 */
const renderToHTML = async (html: string, argv: Arguments) => {
  return writeFile(argv.output, html);
};

export {
  setupHtml,
  filterObj,
  renderToPDF,
  renderToHTML,
  GenericFilterableNamedObject,
  FilterableAny,
};
