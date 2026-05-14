import sanitizeHtmlLib from 'sanitize-html';

const allowedTags = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'a',
    'h1',
    'h2',
    'h3',
];

export const sanitizeRichText = (value: string) =>
    sanitizeHtmlLib(value, {
        allowedTags,
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        transformTags: {
            a: sanitizeHtmlLib.simpleTransform('a', {
                rel: 'noopener noreferrer',
                target: '_blank',
            }),
        },
    });
