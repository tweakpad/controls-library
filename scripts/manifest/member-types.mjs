import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

/** An interface with more fields than this shows its first fields and a count. */
const MAX_FIELDS = 8;

/**
 * Choice lists of the sources, read from the syntax alone: every type alias, `as const` array,
 * class property type and interface under `folder`, plus the DOM library's string unions. A type
 * resolves to its values when every member is a string literal or another choice list:
 * - unions of literals and aliases (`type SortDirection = 'ascending' | 'descending'`);
 * - `(typeof LIST)[number]` over an `as const` array of strings;
 * - `Class['property']` over a property typed by a choice list;
 * - `keyof Interface`;
 * - template literals over choice lists (`${'block-start' | 'block-end'} ${…}`).
 * A name resolves in the module that uses it first, then across the sources when only one
 * definition exists, then in the DOM library.
 */
export function scanChoices(root, folder = 'src') {
  /** Module path → declarations by kind. */
  const modules = new Map();
  /** Name → module paths that declare it, per kind. */
  const index = {
    alias: new Map(),
    list: new Map(),
    class: new Map(),
    interface: new Map(),
    definition: new Map(),
  };
  const declare = (kind, name, module) => {
    const owners = index[kind].get(name) ?? [];
    owners.push(module);
    index[kind].set(name, owners);
  };
  const read = (path, module) => {
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const entry = {
      alias: new Map(),
      list: new Map(),
      class: new Map(),
      interface: new Map(),
      definition: new Map(),
    };
    /** One line of source text, without comments. */
    const line = (node) =>
      ts
        .createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })
        .printNode(ts.EmitHint.Unspecified, node, source)
        .replace(/\s+/gu, ' ')
        .replace(/^\| /u, '')
        .replace(/;(?= \})/gu, '')
        .replace(/; /gu, ', ')
        .trim();
    for (const statement of source.statements) {
      // Every named type keeps its definition, one level deep, for the docs.
      if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
        // A long interface (a texts dictionary) shows its first fields and a count, not a wall.
        const fields = ts.isInterfaceDeclaration(statement)
          ? statement.members.map((member) => line(member).replace(/[;,]$/u, ''))
          : [];
        const shape = ts.isTypeAliasDeclaration(statement)
          ? line(statement.type)
          : fields.length > MAX_FIELDS
            ? `{ ${fields.slice(0, 3).join(', ')}, … (${fields.length} fields) }`
            : `{ ${fields.join(', ')} }`;
        const bases = ts.isInterfaceDeclaration(statement)
          ? (statement.heritageClauses ?? []).flatMap((clause) =>
              clause.types.map((type) => type.getText()),
            )
          : [];
        entry.definition.set(statement.name.text, [...bases, shape].join(' & '));
        declare('definition', statement.name.text, module);
      }
      if (ts.isTypeAliasDeclaration(statement) && !statement.typeParameters) {
        entry.alias.set(statement.name.text, statement.type);
        declare('alias', statement.name.text, module);
      } else if (ts.isVariableStatement(statement)) {
        for (const variable of statement.declarationList.declarations) {
          let initializer = variable.initializer;
          while (
            initializer &&
            (ts.isAsExpression(initializer) || ts.isSatisfiesExpression?.(initializer))
          )
            initializer = initializer.expression;
          if (
            ts.isIdentifier(variable.name) &&
            initializer &&
            ts.isArrayLiteralExpression(initializer) &&
            initializer.elements.length &&
            initializer.elements.every((element) => ts.isStringLiteralLike(element))
          ) {
            entry.list.set(
              variable.name.text,
              initializer.elements.map((element) => element.text),
            );
            declare('list', variable.name.text, module);
          }
        }
      } else if (ts.isClassDeclaration(statement) && statement.name) {
        const properties = new Map();
        for (const member of statement.members)
          if (
            (ts.isPropertyDeclaration(member) || ts.isGetAccessorDeclaration(member)) &&
            member.type &&
            ts.isIdentifier(member.name)
          )
            properties.set(member.name.text, member.type);
        entry.class.set(statement.name.text, properties);
        declare('class', statement.name.text, module);
      } else if (ts.isInterfaceDeclaration(statement) && !statement.typeParameters) {
        entry.interface.set(
          statement.name.text,
          statement.members
            .filter((member) => ts.isPropertySignature(member) && member.name)
            .map((member) => member.name.text ?? member.name.getText()),
        );
        declare('interface', statement.name.text, module);
      }
    }
    modules.set(module, entry);
  };
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts'))
        read(path, relative(root, path).split('\\').join('/'));
    }
  };
  walk(resolve(root, folder));
  const library = resolve(root, 'node_modules/typescript/lib/lib.dom.d.ts');
  if (existsSync(library)) read(library, '#lib.dom');

  /** The module whose `kind` declaration `name` means in `module`. */
  const owner = (kind, name, module) => {
    if (modules.get(module)?.[kind].has(name)) return module;
    const owners = (index[kind].get(name) ?? []).filter((path) => path !== '#lib.dom');
    if (owners.length === 1) return owners[0];
    if (!owners.length && index[kind].get(name)?.includes('#lib.dom')) return '#lib.dom';
    return undefined;
  };
  const memo = new Map();
  const nodeValues = (node, module, seen) => {
    if (ts.isParenthesizedTypeNode(node)) return nodeValues(node.type, module, seen);
    if (ts.isUnionTypeNode(node)) {
      const values = [];
      for (const member of node.types) {
        const next = nodeValues(member, module, seen);
        if (!next) return undefined;
        values.push(...next);
      }
      return [...new Set(values)];
    }
    if (ts.isLiteralTypeNode(node))
      return ts.isStringLiteral(node.literal) ? [node.literal.text] : undefined;
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && !node.typeArguments)
      return nameValues(node.typeName.text, module, seen);
    if (ts.isIndexedAccessTypeNode(node)) {
      let object = node.objectType;
      while (ts.isParenthesizedTypeNode(object)) object = object.type;
      const index = node.indexType;
      if (
        ts.isTypeQueryNode(object) &&
        ts.isIdentifier(object.exprName) &&
        index.kind === ts.SyntaxKind.NumberKeyword
      ) {
        const from = owner('list', object.exprName.text, module);
        return from ? modules.get(from).list.get(object.exprName.text) : undefined;
      }
      if (
        ts.isTypeReferenceNode(object) &&
        ts.isIdentifier(object.typeName) &&
        ts.isLiteralTypeNode(index) &&
        ts.isStringLiteral(index.literal)
      ) {
        const from = owner('class', object.typeName.text, module);
        const property =
          from && modules.get(from).class.get(object.typeName.text).get(index.literal.text);
        return property ? nodeValues(property, from, seen) : undefined;
      }
      return undefined;
    }
    if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.KeyOfKeyword) {
      const target = node.type;
      if (!ts.isTypeReferenceNode(target) || !ts.isIdentifier(target.typeName)) return undefined;
      const from = owner('interface', target.typeName.text, module);
      return from ? modules.get(from).interface.get(target.typeName.text) : undefined;
    }
    if (ts.isTemplateLiteralTypeNode(node)) {
      let values = [node.head.text];
      for (const span of node.templateSpans) {
        const options = nodeValues(span.type, module, seen);
        if (!options) return undefined;
        values = values.flatMap((start) =>
          options.map((option) => `${start}${option}${span.literal.text}`),
        );
      }
      return values;
    }
    return undefined;
  };
  const nameValues = (name, module, seen = new Set()) => {
    const from = owner('alias', name, module);
    if (!from) return undefined;
    const key = `${from}#${name}`;
    if (memo.has(key)) return memo.get(key);
    if (seen.has(key)) return undefined;
    seen.add(key);
    const values = nodeValues(modules.get(from).alias.get(name), from, seen);
    memo.set(key, values);
    return values;
  };

  /**
   * The values of a manifest type text used in `module`: a union of string literals and choice
   * lists; `undefined` and `null` members are skipped. Undefined when any member is not a choice.
   */
  const values = (text, module) => {
    const parts = text
      .split('|')
      .map((part) => part.trim())
      .filter((part) => part && part !== 'undefined' && part !== 'null');
    const found = [];
    for (const part of parts) {
      if (/^'[^']*'$/u.test(part) || /^"[^"]*"$/u.test(part)) found.push(part.slice(1, -1));
      else if (/^[A-Za-z_]\w*$/u.test(part)) {
        const named = nameValues(part, module);
        if (!named) return undefined;
        found.push(...named);
      } else return undefined;
    }
    return found.length ? [...new Set(found)] : undefined;
  };
  /**
   * The source definitions of the named types a type text mentions (`PanelExtent` →
   * `number | string`), one level deep; library and platform types have none.
   */
  const definitions = (text, module) => {
    const found = [];
    for (const [name] of text.matchAll(/\b[A-Z]\w*\b/gu)) {
      if (found.some((entry) => entry.name === name)) continue;
      const from = owner('definition', name, module);
      if (!from || from === '#lib.dom') continue;
      found.push({ name, text: modules.get(from).definition.get(name) });
    }
    return found;
  };
  return { values, definitions };
}

/**
 * Two type fixes the manifest's inheritance step misses, read from the syntax alone:
 * - a member's type keeps the element's own declaration (`override get value(): string`), and a
 *   base's type parameter (`TValue`) becomes the type argument the element passes up its class
 *   chain (`extends TpFormElement<string>`);
 * - a member typed by a choice list gets its values as `type.values`, which Storybook's Controls
 *   list in a select; one typed by another named type gets that type's source definition as
 *   `type.definitions`. Every docs consumer reads both through `elementApi`.
 * Docs fields only: the framework bindings read neither.
 */
export function tweakpadMemberTypes(choices) {
  /** Class name → { parameters, base, baseArguments, types }. */
  const classes = new Map();
  return {
    name: 'tweakpad-member-types',
    initialize() {
      classes.clear();
    },
    analyzePhase({ ts: compiler, node }) {
      if (!compiler.isClassDeclaration(node) || !node.name) return;
      const heritage = node.heritageClauses?.find(
        (clause) => clause.token === compiler.SyntaxKind.ExtendsKeyword,
      )?.types[0];
      // A mixin base (`Scrollable(TpElement)`) names its innermost class.
      let base = heritage?.expression;
      while (base && compiler.isCallExpression(base)) base = base.arguments[0];
      const types = new Map();
      for (const member of node.members)
        if (
          (compiler.isGetAccessorDeclaration(member) || compiler.isPropertyDeclaration(member)) &&
          member.type &&
          member.name &&
          compiler.isIdentifier(member.name)
        )
          types.set(member.name.text, member.type.getText());
      classes.set(node.name.text, {
        parameters: (node.typeParameters ?? []).map((parameter) => parameter.name.text),
        // A parameter the subclass leaves out takes its default (`TpFormElement<TValue = string>`).
        defaults: (node.typeParameters ?? []).map((parameter) => parameter.default?.getText()),
        base: base && compiler.isIdentifier(base) ? base.text : undefined,
        baseArguments: (heritage?.typeArguments ?? []).map((argument) => argument.getText()),
        types,
      });
    },
    packageLinkPhase({ customElementsManifest }) {
      /** `text`, written with `owner`'s type parameters, as the class `name` sees it. */
      const substitute = (name, owner, text) => {
        const chain = [];
        const visited = new Set();
        for (let current = name; current && current !== owner && !visited.has(current);) {
          visited.add(current);
          chain.push(current);
          current = classes.get(current)?.base;
        }
        if (!classes.has(owner)) return text;
        let result = text;
        let from = owner;
        for (const child of chain.reverse()) {
          const parameters = classes.get(from)?.parameters ?? [];
          const defaults = classes.get(from)?.defaults ?? [];
          const passed = classes.get(child)?.baseArguments ?? [];
          result = result.replace(/\b[A-Z]\w*\b/gu, (word) => {
            const at = parameters.indexOf(word);
            return at >= 0 ? (passed[at] ?? defaults[at] ?? word) : word;
          });
          from = child;
        }
        return result;
      };
      for (const module of customElementsManifest.modules)
        for (const declaration of module.declarations ?? []) {
          if (declaration.kind !== 'class') continue;
          const entries = [
            ...(declaration.attributes ?? []).map((entry) => [entry, entry.fieldName]),
            ...(declaration.members ?? [])
              .filter((entry) => entry.kind === 'field' && !entry.static)
              .map((entry) => [entry, entry.name]),
          ];
          for (const [entry, field] of entries) {
            const own = field && classes.get(declaration.name)?.types.get(field);
            if (entry.inheritedFrom && own && own !== entry.type?.text) entry.type = { text: own };
            else if (entry.inheritedFrom?.name && entry.type?.text) {
              const text = substitute(declaration.name, entry.inheritedFrom.name, entry.type.text);
              if (text !== entry.type.text) entry.type = { text };
            }
            const text = entry.type?.text;
            if (!text) continue;
            const values = choices.values(text, typeModule(entry, module));
            const definitions = values ? [] : choices.definitions(text, typeModule(entry, module));
            if (values) entry.type = { ...entry.type, values };
            else if (definitions.length) entry.type = { ...entry.type, definitions };
          }
        }
    },
  };
}

/** The module whose names a member's type uses: the base's module for an inherited member. */
const typeModule = (entry, module) => entry.inheritedFrom?.module ?? module.path;
