"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBackXFill = exports.reasonToString = exports.isXFill = exports.isInjectable = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const isInjectable = (n) => n.fill && typeof n.fill === "function" && n.raw;
exports.isInjectable = isInjectable;
const isXFill = (n) => n.xfill && typeof n.xfill === "function";
exports.isXFill = isXFill;
const reasonToString = (reason, lang, value) => {
    if (typeof reason === "string")
        return reason;
    else
        return reason.fill({ value: value || lang.unknownReason });
};
exports.reasonToString = reasonToString;
const UserBackXFill = (inp, cls) => {
    return ({ value, onClick, }) => (react_1.default.createElement(react_1.default.Fragment, null,
        inp,
        " ",
        react_1.default.createElement("span", { className: cls, onClick: onClick }, value),
        ":"));
};
exports.UserBackXFill = UserBackXFill;
