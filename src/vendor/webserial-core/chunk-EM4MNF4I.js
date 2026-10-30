/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/device/descriptor.ts
function param(spec) {
  return spec;
}
function action(spec) {
  return spec;
}
function defineDevice(spec) {
  return spec;
}
function describeParams(params) {
  return params.map((spec) => ({
    key: spec.key,
    label: spec.label,
    readable: Boolean(spec.read),
    writable: Boolean(spec.write),
    ...spec.read ? { readCommand: spec.read } : {},
    ...spec.write ? { writeCommand: spec.write } : {},
    ...spec.unit ? { unit: spec.unit } : {},
    ...spec.description ? { description: spec.description } : {}
  }));
}
function describeActions(actions = []) {
  return actions.map((spec) => ({
    key: spec.key,
    label: spec.label,
    command: spec.command,
    ...spec.category ? { category: spec.category } : {},
    ...spec.description ? { description: spec.description } : {}
  }));
}

export { action, defineDevice, describeActions, describeParams, param };
//# sourceMappingURL=chunk-EM4MNF4I.js.map
//# sourceMappingURL=chunk-EM4MNF4I.js.map