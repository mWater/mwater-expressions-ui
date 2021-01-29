"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExprUIExtensions = exports.registerExprUIExtension = void 0;
/** Global list of extensions */
var exprUIExtensions = [];
/** Register an extension to expressions UI
 */
function registerExprUIExtension(extension) {
    exprUIExtensions.push(extension);
}
exports.registerExprUIExtension = registerExprUIExtension;
/** Get all extensions registered */
function getExprUIExtensions() {
    return exprUIExtensions;
}
exports.getExprUIExtensions = getExprUIExtensions;
