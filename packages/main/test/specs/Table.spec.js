import { assert } from "chai";

const ROLE_COLUMN_HEADER = "columnheader";

describe("Table - Rendering", async () => {
	it("tests if table is rendered", async () => {
		await browser.url(`test/pages/Table.html`);

		const table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		assert.ok(headerRow.isExisting(), "Header row exists");

		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");
	});

	it ("tests if initial empty table renders without errors", async () => {
		await browser.url(`test/pages/TableEmpty.html`);

		const errorInput = await browser.$("#error");
		assert.ok(await errorInput.isExisting(), "Error input exists");
		assert.equal(await errorInput.getValue(), "", "Exception was not thrown");
	});
});

describe("Table - Popin Mode", async () => {
	before(async () => {
		await browser.url(`test/pages/TablePopin.html`);
	});

	it("no pop-in with 'optimal' table width", async () => {
		let table = await browser.$("#table0");
		assert.ok(table.isExisting(), "Table exists");

		assert.strictEqual(await table.getSize("width"), 850, "Table is 850px wide");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 4, "4 columns exist");

		for (const [index, headerCell] of headerCells.entries()) {
			assert.strictEqual(await headerCell.getAttribute("role"), ROLE_COLUMN_HEADER, "Correct role is applied");
			assert.ok(await headerRow.shadow$(`slot[name=default-${index + 1}]`).isExisting(), `Header cell ${index + 1} has been rendered`);
		}
	});

	it("test with one by one popping in", async() => {
		let table = await browser.$("#table0");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");

		const testWidths = [
			{width: 850, poppedIn: []},
			{width: 700, poppedIn: ["colD"]},
			{width: 500, poppedIn: ["colD", "colC"]},
			{width: 300, poppedIn: ["colD", "colC", "colB"]},
			{width: 150, poppedIn: ["colD", "colC", "colB"]}
		];

		for (const testWidth of testWidths) {
			await table.setProperty("style", `width: ${testWidth.width}px`);
			assert.strictEqual(await table.getSize("width"), testWidth.width, `Table is ${testWidth.width} wide`);

			for (const headerCell of headerCells) {
				const headerRole = await headerCell.getAttribute("role");
				const headerId = await headerCell.getAttribute("id");
				const slotName = await headerCell.getAttribute("slot");

				let expectRole = true;
				if (testWidth.poppedIn.includes(headerId)) {
					expectRole = false;
				}

				assert.strictEqual(headerRole === ROLE_COLUMN_HEADER, expectRole, `Cell has role (width: ${testWidth.width}): (${expectRole})`)
				assert.strictEqual(await headerRow.shadow$(`slot[name=${slotName}]`).isExisting(), expectRole, `Header cell ${slotName} has been rendered (width: ${testWidth.width}): ${expectRole}`);
			}
		}
	});

	it("test with one by one popping out", async () => {
		let table = await browser.$("#table0");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");

		const testWidths = [
			{width: 150, poppedIn: ["colD", "colC", "colB"]},
			{width: 300, poppedIn: ["colD", "colC", "colB"]},
			{width: 500, poppedIn: ["colD", "colC"]},
			{width: 700, poppedIn: ["colD"]},
			{width: 850, poppedIn: []},
		];

		for (const testWidth of testWidths) {
			await table.setProperty("style", `width: ${testWidth.width}px`);
			assert.strictEqual(await table.getSize("width"), testWidth.width, `Table is ${testWidth.width} wide`);

			for (const headerCell of headerCells) {
				const headerRole = await headerCell.getAttribute("role");
				const headerId = await headerCell.getAttribute("id");
				const slotName = await headerCell.getAttribute("slot");

				let expectRole = true;
				if (testWidth.poppedIn.includes(headerId)) {
					expectRole = false;
				}

				assert.strictEqual(headerRole === ROLE_COLUMN_HEADER, expectRole, `Cell has role (width: ${testWidth.width}): (${expectRole})`)
				assert.strictEqual(await headerRow.shadow$(`slot[name=${slotName}]`).isExisting(), expectRole, `Header cell ${slotName} has been rendered (width: ${testWidth.width}): ${expectRole}`);
			}
		}
	});

	it("test with random widths", async () => {
		let table = await browser.$("#table0");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");

		const expectedStates = [
			{width: 500, poppedIn: ["colD", "colC", "colB"]},
			{width: 700, poppedIn: ["colD", "colC"]},
			{width: 850, poppedIn: ["colD"]},
			{width: Infinity, poppedIn: []}
		];

		const runs = 10;
		for (let i = 0; i < runs; i++) {
			const randomWidth = Math.floor(Math.random() * 1000) + 1;
			await table.setProperty("style", `width: ${randomWidth}px`);

			const tableSize = await table.getSize("width");
			assert.strictEqual(tableSize, randomWidth, `Table is ${randomWidth} wide`);

			const expectedState = expectedStates.find(state => tableSize < state.width);
			for (const headerCell of headerCells) {
				const headerRole = await headerCell.getAttribute("role");
				const headerId = await headerCell.getAttribute("id");
				const slotName = await headerCell.getAttribute("slot");

				let expectRole = true;
				if (expectedState.poppedIn.includes(headerId)) {
					expectRole = false;
				}

				assert.strictEqual(headerRole === ROLE_COLUMN_HEADER, expectRole, `Cell ${headerId} has role (width: ${tableSize}): (${expectRole})`)
				assert.strictEqual(await headerRow.shadow$(`slot[name=${slotName}]`).isExisting(), expectRole, `Header cell ${slotName} has been rendered (width: ${tableSize}): ${expectRole}`);
			}
		}
	});
});

describe("Table - Horizontal alignment of cells", async () => {
	beforeEach(async () => {
		await browser.url(`test/pages/HAlignTable.html`);
	});

	it("default alignment when horizontalAlign is not set", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		const index = 0;
		const headerCell = headerCells[index];
		const alignment = "normal";
		assert.equal(await headerCell.getAttribute("id"), "productCol", "Correct cell");
		assert.equal(await headerCell.getAttribute("horizontal-align"), undefined, "horizontalAlign not set");

		const justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		const style = await headerCell.getAttribute("style");
  		const justifyContentHeaderCellUncomputed = style.match(/justify-content: ([^;]+)/)[1];
		const cssVariable = "var(--horizontal-align-default-1)";
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");
		assert.equal(justifyContentHeaderCellUncomputed, cssVariable, "horizontalAlign not set");

		const tableRows = await table.$$("ui5-table-row");
		for (const row of tableRows) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[3].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, alignment, "justify-content correctly set.");
		}
	});

	it("horizontal alignment if horizontalAlign is set to a value not defined in TableCellHorizontalAlign", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		const index = 0;
		const headerCell = headerCells[index];
		assert.equal(await headerCell.getAttribute("id"), "productCol", "Correct cell");

		let alignment = "right";
		await headerCell.setAttribute("horizontal-align", "Right");

		let justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		let style = await headerCell.getAttribute("style");
  		let justifyContentHeaderCellUncomputed = style.match(/justify-content: ([^;]+)/)[1];
		const cssVariable = "var(--horizontal-align-default-1)";
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");
		assert.equal(justifyContentHeaderCellUncomputed, cssVariable, "horizontalAlign set to css variable");

		alignment = "normal";
		let hAlign = "valueNotDefinedInEnum";
		await headerCell.setAttribute("horizontal-align", hAlign);

		assert.equal(await headerCell.getAttribute("horizontal-align"), hAlign, "horizontalAlign correctly set");
		justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");
		style = await headerCell.getAttribute("style");
		justifyContentHeaderCellUncomputed = style.match(/justify-content: ([^;]+)/)[1];
		assert.equal(justifyContentHeaderCellUncomputed, cssVariable, "horizontalAlign set to css variable");

		const tableRows = await table.$$("ui5-table-row");
		for (const row of tableRows) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[3].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, alignment, "justify-content correctly set.");
		}
	});

	it("cells have same alignment as their headerCell", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		const cellIndex = 1; // second row is supplier row
		const headerCell = headerCells[cellIndex];
		const id = await headerCell.getAttribute("id");
		const hAlign = await headerCell.getAttribute("horizontal-align");
		assert.equal(id, "supplierCol", "Correct cell");
		assert.ok(hAlign, "horizontalAlign set");

		const alignment = `center`; // alignment set to center in table example
		const justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");

		const tableRows = await table.$$("ui5-table-row");
		for (const row of tableRows) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[cellIndex].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, alignment, "justify-content correctly set.");
		}
	});

	it("on changing the horizontal-alignment of the headerCell, the horizontal-alignment of subsequent cells must change as well", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		// test setup
		const cellIndex = 1; // second row is supplier row
		const headerCell = headerCells[cellIndex];
		const id = await headerCell.getAttribute("id");
		let hAlign = await headerCell.getAttribute("horizontal-align");
		assert.equal(id, "supplierCol", "Correct cell");
		assert.ok(hAlign, "horizontalAlign set");

		let alignment = `center`; // alignment set to center in table example
		let justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");

		// update the values
		alignment = "left";
		await headerCell.setAttribute("horizontal-align", "Left");
		hAlign = await headerCell.getAttribute("horizontal-align");
		justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");

		assert.equal(id, "supplierCol", "Correct cell");
		assert.ok(hAlign, "horizontalAlign set");
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content value updated.");

		const tableRows = await table.$$("ui5-table-row");
		for (const row of tableRows) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[cellIndex].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, alignment, "justify-content correctly set.");
		}
	});

	it("on changing the horizontal-alignment of a cell, the horizontal-alignment of other cells must not change", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		const cellIndex = 1; // second row is supplier row
		const headerCell = headerCells[cellIndex];
		const id = await headerCell.getAttribute("id");
		const hAlign = await headerCell.getAttribute("horizontal-align");
		assert.equal(id, "supplierCol", "Correct cell");
		assert.ok(hAlign, "horizontalAlign set");

		const alignment = `center`; // alignment set to center in table example
		const justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content value of the headerCell is correct.");

		const tableRows = await table.$$("ui5-table-row");
		const rowWithChangedCell = 0;
		const cell = await tableRows[rowWithChangedCell].$$("ui5-table-cell")[cellIndex];
		let hAlignCell = await cell.getAttribute("horizontal-align");
		assert.equal(hAlignCell, null, "horizontalAlign property of the cell is not set.");

		let justifyContentCell = await cell.getCSSProperty("justify-content");
		assert.equal(justifyContentCell.value, alignment, "justify-content of the cell matches the headerCell");

		const customAlignmentCell = "left"; // alignment used for a single cell
		await cell.setAttribute("horizontal-align", "Left");
		hAlignCell = await cell.getAttribute("horizontal-align");
		assert.notEqual(hAlignCell, null, "horizontalAlign property of the cell is set now.");

		justifyContentCell = await cell.getCSSProperty("justify-content");
		assert.equal(justifyContentCell.value, customAlignmentCell, "justify-content was changed and now matches the custom cell alignment value.");

		for (const [index, row] of tableRows.entries()) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[cellIndex].getCSSProperty("justify-content");

			// the alignment of every cell but the changed one still has to match the headerCell alignment
			assert.equal(justifyContent.value, index === rowWithChangedCell ? customAlignmentCell : alignment, "justify-content correctly set.");
		}
	});

	it("the horizontal-alignment of a cell differs from the others, on changing the horizontal-alignment of the headerCell, the horizontal-alignment of other cells must change as well except of this one custom aligned cell", async () => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");
		assert.equal(headerCells.length, 5, "5 columns exist");

		const cellIndex = 1; // second row is supplier row
		const headerCell = headerCells[cellIndex];
		const id = await headerCell.getAttribute("id");
		const hAlign = await headerCell.getAttribute("horizontal-align");
		assert.equal(id, "supplierCol", "Correct cell");
		assert.ok(hAlign, "horizontalAlign set");

		let alignment = "center"; // alignment set to center in table example
		let justifyContent = await headerCell.getCSSProperty("justify-content");
		assert.equal(justifyContent.value, alignment, "justify-content correctly set.");

		const tableRows = await table.$$("ui5-table-row");
		const rowWithChangedCell = 0;
		const cell = await tableRows[rowWithChangedCell].$$("ui5-table-cell")[cellIndex];
		let justifyContentCell = await cell.getCSSProperty("justify-content");
		let hAlignCell = await cell.getAttribute("horizontal-align");
		assert.equal(hAlignCell, null, "horizontalAlign property of the cell is not set.");
		assert.equal(justifyContentCell.value, alignment, "justify-content value matches headerCell alignment");

		const customAlignmentCell = "left"; // alignment used for a single cell
		await cell.setAttribute("horizontal-align", "Left");
		hAlignCell = await cell.getAttribute("horizontal-align");

		assert.notEqual(hAlignCell, null, "horizontalAlign property of the cell is set now.");

		justifyContentCell = await cell.getCSSProperty("justify-content");
		assert.equal(justifyContentCell.value, customAlignmentCell, "justify-content of cell adjusted correctly.");

		alignment = "right"
		await headerCell.setAttribute("horizontal-align", "Right");
		hAlignCell = await cell.getAttribute("horizontal-align");
		justifyContent = await headerCell.getCSSProperty("justify-content");

		assert.ok(hAlign, "horizontalAlign set");
		assert.equal(justifyContent.value, alignment, "justify-content of headerCell changed correctly.");

		for (const [index, row] of tableRows.entries()) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[cellIndex].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, index === rowWithChangedCell ? customAlignmentCell : alignment, "justify-content correctly set.");
		}
	});

	it("test horizontalAlign behavior with one by one popping in", async() => {
		let table = await browser.$("#table");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const headerCells = await headerRow.$$("ui5-table-header-cell");

		const testWidths = [
			{width: 1120, poppedIn: []},
			{width: 900, poppedIn: ["priceCol"]},
			{width: 800, poppedIn: ["priceCol", "weightCol"]},
			{width: 500, poppedIn: ["priceCol", "weightCol", "dimensionsCol"]},
			{width: 300, poppedIn: ["priceCol", "weightCol", "dimensionsCol", "supplierCol"]}
		];

		for (const testWidth of testWidths) {
			await table.setProperty("style", `width: ${testWidth.width}px`);
			assert.strictEqual(await table.getSize("width"), testWidth.width, `Table is ${testWidth.width} wide`);

			for (const [index, headerCell] of headerCells.entries()) {
				const headerRole = await headerCell.getAttribute("role");
				const headerId = await headerCell.getAttribute("id");
				const slotName = await headerCell.getAttribute("slot");

				let expectRole = true;
				if (testWidth.poppedIn.includes(headerId)) {
					expectRole = false;
				}

				assert.strictEqual(headerRole === ROLE_COLUMN_HEADER, expectRole, `Cell has role (width: ${testWidth.width}): (${expectRole})`)
				assert.strictEqual(await headerRow.shadow$(`slot[name=${slotName}]`).isExisting(), expectRole, `Header cell ${slotName} has been rendered (width: ${testWidth.width}): ${expectRole}`);

				const style = await headerCell.getAttribute("style");
				const justifyContentHeaderCellUncomputed = style.match(/justify-content: ([^;]+)/)[1];
				const cssVariable = `var(--horizontal-align-default-${index+1})`;
				assert.equal(justifyContentHeaderCellUncomputed, cssVariable);

				// justify-content should be the default value in case the cell is inside the popin area
				if (!expectRole) {
					const tableRows = await table.$$("ui5-table-row");
					for (const row of tableRows) {
						const rowCells = await row.$$("ui5-table-cell");
						const justifyContent = await rowCells[index].getCSSProperty("justify-content");

						assert.equal(justifyContent.value, "normal", "justify-content correctly set.");
					}
				}
			}
		}

		/* const justifyContentHeaderCell = await headerCell.getCSSProperty("justify-content");
		const style = await headerCell.getAttribute("style");
  		const justifyContentHeaderCellUncomputed = style.match(/justify-content: ([^;]+)/)[1];
		const cssVariable = "var(--horizontal-align-default-1)";
		assert.equal(justifyContentHeaderCell.value, alignment, "justify-content correctly set.");
		assert.equal(justifyContentHeaderCellUncomputed, cssVariable, "horizontalAlign not set");

		const tableRows = await table.$$("ui5-table-row");
		for (const row of tableRows) {
			const rowCells = await row.$$("ui5-table-cell");
			const justifyContent = await rowCells[3].getCSSProperty("justify-content");

			assert.equal(justifyContent.value, alignment, "justify-content correctly set.");
		} */
	});
});

// Tests for the fixed header, whether it is shown correctly and behaves as expected
describe("Table - Fixed Header", async () => {
	before(async () => {
		await browser.url(`test/pages/TableFixedHeader.html`);
	});

	// Test case, check whether the header is fixed when scrolling
	it("fixed header with wrapping container that has scrolling", async () => {
		const table = await browser.$("#table0");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const stickyProperty = await headerRow.getCSSProperty("position");
		const topProperty = await headerRow.getCSSProperty("top");

		assert.strictEqual(stickyProperty.value, "sticky", "Header CSS is sticky");
		assert.strictEqual(topProperty.value, "50px", "Header is 50px from the top");

		const lastRow = await browser.$("#row-21");
		await lastRow.scrollIntoView();

		const headerYPosition = await headerRow.getLocation("y");
		assert.isAbove(headerYPosition, 50, "Header is above the viewport and above the toolbar");
		assert.ok(headerRow.isDisplayedInViewport(), "Header is displayed in the viewport");
	});

	it("fixed header with table being scrollable", async () => {
		const table = await browser.$("#table1");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const stickyProperty = await headerRow.getCSSProperty("position");
		const topProperty = await headerRow.getCSSProperty("top");

		assert.strictEqual(stickyProperty.value, "sticky", "Header CSS is sticky");
		assert.strictEqual(topProperty.value, "0px", "Header is 0 from the top");

		const lastRow = await browser.$("#row-21-1");
		await lastRow.scrollIntoView();

		const headerYPosition = await headerRow.getLocation("y");
		assert.isAbove(headerYPosition, 300, "Header is above the viewport and above the toolbar");
		assert.ok(headerRow.isDisplayedInViewport(), "Header is displayed in the viewport");
	});

	it("fixed header with body being the scroll container", async() => {
		const table = await browser.$("#table2");
		assert.ok(table.isExisting(), "Table exists");

		const headerRow = await table.$("ui5-table-header-row");
		const stickyProperty = await headerRow.getCSSProperty("position");
		const topProperty = await headerRow.getCSSProperty("top");

		assert.strictEqual(stickyProperty.value, "sticky", "Header CSS is sticky");
		assert.strictEqual(topProperty.value, "50px", "Header is 50px from the top");

		const lastRow = await browser.$("#row-100-2");
		await lastRow.scrollIntoView();

		const headerYPosition = await headerRow.getLocation("y");
		assert.isAbove(headerYPosition, 50, "Header is above the viewport and above the toolbar");
		assert.ok(headerRow.isDisplayedInViewport(), "Header is displayed in the viewport");
	});
});

describe("Table - Horizontal Scrolling", async () => {
	before(async () => {
		await browser.url(`test/pages/TableHorizontal.html`);
	});

	it("navigated indicator is fixed to the right", async () => {
		const table = await browser.$("#table");

		assert.ok(await table.isExisting(), "Table exists");

		const row = await browser.$("#firstRow");
		const navigatedCell = await row.shadow$("#navigated-cell");

		assert.ok(await navigatedCell.isExisting(), "Navigated cell exists");

		const stickyProperty = await navigatedCell.getCSSProperty("position");
		const rightProperty = await navigatedCell.getCSSProperty("right");

		assert.strictEqual(stickyProperty.value, "sticky", "Navigated cell is sticky");
		assert.strictEqual(rightProperty.value, "0px", "Navigated cell is at the right edge");
	});

	it("selection column should be fixed to the left", async () => {
		const table = await browser.$("#table");
		const lastColumn = await browser.$("#lastCell");

		assert.ok(await table.isExisting(), "Table exists");

		const { leftOffset, fixedX } = await browser.execute(() => {
			const table = document.getElementById("table");
			const row = document.getElementById("firstRow");
			return {
				fixedX: row.shadowRoot.querySelector("#selection-cell").getBoundingClientRect().x,
				leftOffset: table.shadowRoot.querySelector("#table")?.scrollLeft || 0
			};
		});

		assert.equal(leftOffset, 0, "Table is not scrolled horizontally");
		assert.equal(fixedX, 0, "Selection column is fixed to the left");

		await lastColumn.scrollIntoView();

		const { leftOffset2, fixedX2 } = await browser.execute(() => {
			const table = document.getElementById("table");
			const row = document.getElementById("firstRow");
			return {
				fixedX2: row.shadowRoot.querySelector("#selection-cell").getBoundingClientRect().x,
				leftOffset2: table._tableElement.scrollLeft || 0
			};
		});

		assert.ok(leftOffset2 > 0, "Table is scrolled horizontally");
		assert.equal(fixedX2, 0, "Selection column is still fixed to the left");
	});
});

// Tests navigated property of rows
describe("Table - Navigated Rows", async () => {
	before(async () => {
		await browser.url(`test/pages/TableLoading.html`);
	});

	it("Navigated cell is rendered", async () => {
		await browser.executeAsync(done => {
			document.getElementById("row1").navigated = true;
			done();
		});

		const row1 = await browser.$("#row1");
		const row2 = await browser.$("#row1");
		const navigatedCell1 = await row1.shadow$("#navigated-cell");
		const navigatedCell2 = await row1.shadow$("#navigated-cell");

		assert.ok(await navigatedCell1.isExisting(), "The navigated cell is rendered for the row with navigated=true");
		assert.ok(await navigatedCell2.isExisting(), "The navigated cell is also rendered for the row with navigated=false");
		assert.strictEqual(await navigatedCell1.getAttribute("excluded-from-navigation"), "", "The navigated cell is excluded from item navigation");
		assert.strictEqual(await navigatedCell2.getAttribute("excluded-from-navigation"), "", "The navigated cell is excluded from item navigation");

		const navigated1BG = await browser.executeAsync(done => {
			done(getComputedStyle(document.getElementById("row1").shadowRoot.querySelector("#navigated")).backgroundColor);
		});
		const navigated2BG = await browser.executeAsync(done => {
			done(getComputedStyle(document.getElementById("row2").shadowRoot.querySelector("#navigated")).backgroundColor);
		});
		assert.notEqual(navigated1BG, navigated2BG, "Background color of navigated cell is different from the one of non-navigated cell");

		const gridTemplateColumns = await browser.executeAsync(done => {
			done(document.getElementById("table1").shadowRoot.querySelector("#table").style.gridTemplateColumns);
		});
		assert.ok(gridTemplateColumns.endsWith("table_navigated_cell_width)"), "gridTemplateColumns is correct");
	});
});