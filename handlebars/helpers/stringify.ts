import hbs, { SafeString } from 'handlebars';
import type { GenericFilterableNamedObject } from '../../lib';

/**
 * Render `content` as a comma-separated list
 * @param {string|Array<GenericFilterableNamedObject>} content - some description, in list or string format
 * @returns {string | SafeString} HTML to render
 */
const stringify = (
  content: string | Array<GenericFilterableNamedObject>
): string | SafeString => {
  return Array.isArray(content)
    ? new hbs.SafeString(content.map((elem) => elem.name).join(', '))
    : content;
};

export default stringify;
