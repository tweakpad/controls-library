const text = { type: 'string', minLength: 1 } as const;
const colors = { type: 'array', items: text } as const;

/**
 * The JSON Schema (2020-12) of a color collection document, for editors and for validating
 * collection files before they ship.
 */
export const colorCollectionSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Color collection',
  type: 'object',
  required: ['id', 'colors'],
  properties: {
    $schema: { type: 'string' },
    id: text,
    name: text,
    description: text,
    attribution: {
      type: 'object',
      properties: { name: text, url: { type: 'string', format: 'uri' }, license: text },
      additionalProperties: false,
    },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: { id: text, name: text },
        additionalProperties: false,
      },
    },
    colors: {
      type: 'array',
      items: {
        oneOf: [
          text,
          {
            type: 'object',
            required: ['value'],
            properties: { value: text, name: text, group: text },
            additionalProperties: false,
          },
        ],
      },
    },
    palettes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['colors'],
        properties: {
          name: text,
          colors: { ...colors, minItems: 2, maxItems: 12 },
          weights: { type: 'array', items: { type: 'number', minimum: 0 }, maxItems: 12 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;
