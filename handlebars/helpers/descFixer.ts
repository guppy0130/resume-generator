import hbs, { SafeString } from 'handlebars';

/**
 * Make `content` suitable for rendering
 * @param {string|Array<string>} content - some description, in list or string format
 * @returns {string|SafeString} HTML to render
 */
const descFixer = (content: string | Array<string>): string | SafeString => {
  return Array.isArray(content)
    ? new hbs.SafeString(`<ul><li>${content.join('</li><li>')}</li></ul>`)
    : content;
};

export default descFixer;
