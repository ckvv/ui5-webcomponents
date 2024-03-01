import DataType from "./DataType.js";

/**
 * @class
 * DOM Element reference or ID.
 * **Note:** If an ID is passed, it is expected to be part of the same `document` element as the consuming component.
 *
 * @public
 */
class DOMReference extends DataType {
	static override isValid(value: string | HTMLElement) {
		return (typeof value === "string" || value instanceof HTMLElement);
	}

	static override propertyToAttribute(propertyValue: string | HTMLElement) {
		if (propertyValue instanceof HTMLElement) {
			return null;
		}

		return propertyValue;
	}
}

export default DOMReference;
