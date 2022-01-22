import { MouseEventHandler } from "react";
import { Language } from ".";
export declare type InjectableField<T> = {
    raw: string;
    fill(fill: T): string;
};
export declare type XFill<T> = {
    xfill?(fill: T): JSX.Element;
};
export declare type XFillOnClick<T> = InjectableField<T> & XFill<T & {
    onClick: MouseEventHandler;
}>;
export declare const reasonToString: (reason: string | InjectableField<{
    value: string;
}>, lang: Language, value?: string) => string;
export declare const UserBackXFill: (inp: string, cls: string) => ({ value, onClick, }: {
    value: string;
    onClick: MouseEventHandler;
}) => JSX.Element;
