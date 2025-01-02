import { AddressObject } from 'mailparser';


export function getAddressTexts (input: AddressObject | AddressObject[] | undefined): string[] {

    if (!input) return [];

    if (Array.isArray(input)) {
        return input.flatMap(item => getAddressTexts(item));
    }

    if (input.value) {
        return input.value
            .map(v => v.address)
            .filter((address): address is string => typeof address === 'string');
    }
    return []
};


export function ensureArray(input: string | string[]): string[] {
    return Array.isArray(input) ? input : [input];
}

