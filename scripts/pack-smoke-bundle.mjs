/** Recognizes emitted tag literals without matching CSS token prefixes such as --tp-selection. */
export function hasTagLiteral(source, tag) {
  return source.includes(JSON.stringify(tag)) || source.includes(`'${tag}'`);
}
