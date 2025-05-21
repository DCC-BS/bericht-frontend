const isObject = (val: unknown) => val !== null && typeof val === "object";
const isArray = Array.isArray;

/**
 * Deeply unref a value, recursing into objects and arrays.
 *
 * @param {Mixed} val - The value to deeply unref.
 *
 * @return {Mixed}
 */
export function deepToRaw<T>(val: T): T {
    const rawVal = toRaw(val);

    if (val instanceof Blob) {
        return toRaw(val) as T;
    }

    if (!isObject(rawVal)) {
        return rawVal;
    }

    if (isArray(rawVal)) {
        return toRawArray(rawVal) as T;
    }

    return unrefObject(rawVal);
}

/**
 * Unref a value, recursing into it if it's an object.
 *
 * @param {Mixed} val - The value to unref.
 *
 * @return {Mixed}
 */
function smartToRaw<T>(val: T): T {
    // Non-ref object?  Go deeper!
    if (val !== null && typeof val === "object") {
        return deepToRaw(val);
    }

    return toRaw(val);
}

/**
 * Unref an array, recursively.
 *
 * @param {Array} arr - The array to unref.
 *
 * @return {Array}
 */
function toRawArray<T>(arr: T[]): T[] {
    return arr.map(smartToRaw);
}

/**
 * Unref an object, recursively.
 *
 * @param {Object} obj - The object to unref.
 *
 * @return {Object}
 */
function unrefObject<T>(obj: T): T {
    const unreffed = {} as T;

    // Object? un-ref it!
    for (const key in obj) {
        unreffed[key] = smartToRaw(obj[key]);
    }

    return unreffed;
}
