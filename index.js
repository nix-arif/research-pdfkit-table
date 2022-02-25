const PDFDocument = require("pdfkit");

class PDFDocumentWithTable extends PDFDocument {
  table(table, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        typeof table === "string" && (table = JSON.parse(table));

        table || (table = {});
        options || (options = {});

        table.headers || (table.headers = []);
        table.datas || (table.datas = []);
        table.rows || (table.rows = []);
        table.options && (options = { ...options, ...table.options });

        // divider lines
        options.divider || (options.divider = {});
        options.divider.header ||
          (options.divider.header = {
            disabled: false,
            width: undefined,
            opacity: undefined,
          });
        options.divider.horizontal ||
          (options.divider.horizontal = {
            disabled: false,
            width: undefined,
            opacity: undefined,
          });
        options.divider.vertical ||
          (options.divider.vertical = {
            disabled: false,
            width: undefined,
            opacity: undefined,
          });

        if (!table.headers.length) reject(new Error("Headers not defined"));

        const title = table.title ? table.title : options.title || "";
        const subtitle = table.subtitle
          ? table.subtitle
          : options.subtitle || "";

        // const columnIsDefined = options.columnSize.length ? true : false;
        const columnSpacing = options.columnSpacing || 3;
        let columnSizes = [];
        let columnPositions = []; // 0, 10, 20, 30, 100
        let columnWidth = 0;

        const rowDistance = 0.5;
        let cellPadding = { top: 0, right: 0, bottom: 0, left: 0 }; //universal

        const prepareHeader =
          options.prepareHeader ||
          (() =>
            this.fillColor("black").font("Helvetica-Bold").fontSize(8).fill());

        const prepareRow =
          options.prepareRow ||
          ((row, indexColumn, indexRow, rectRow, rectCell) =>
            this.fillColor("black").font("Helvetica").fontSize(8).fill());

        let tableWidth = 0;
        const maxY = this.page.height - this.page.margins.bottom;

        let startX = options.x || this.x || this.page.margins.left;
        let startY = options.y || this.y || this.page.margins.top;

        let lastPositionX = 0;
        let rowBottomY = 0;

        //------------experimental fast variables
        this.titleHeight = 0;
        this.headerHeight = 0;
        this.firstLineHeight = 0;
        this.lockAddTitles = false;
        this.lockAddPage = false;
        this.lockAddHeader = false;
        this.safelyMarginBottom = 15;

        // reset position to margin.left
        if (options.x === null || options.x === -1) {
          startX = this.page.margins.left;
        }

        const createTitle = (data, size, opacity) => {
          // Title
          if (!data) return;

          // get height line
          // let cellHeight = 0
          // if string
          if (typeof data === "string") {
            // font size
            this.fillColor("black")
              .font("Helvetica")
              .fontSize(8)
              .fontSize(size)
              .opacity(opacity);

            // write
            this.text(data, startX, startY).opacity(1);
            // startY += cellHeight;
            startY = this.y + columnSpacing + 2;
          }
        };

        const prepareCellPadding = (p) => {
          // array
          if (Array.isArray(p)) {
            switch (p.length) {
              case 3:
                p = [...p, 0];
                break;
              case 2:
                p = [...p, ...p];
                break;
              case 1:
                p = Array(4).fill(p[0]);
                break;
            }
          }

          // Number
          else if (typeof p === "number") {
            p = Array(4).fill(p);
          }

          // object
          else if (typeof p === "object") {
            const { top, right, bottom, left } = p;
            p = [top, right, bottom, left];
          }

          return {
            top: p[0] >> 0, // int
            right: p[1] >> 0,
            bottom: p[2] >> 0,
            left: p[3] >> 0,
          };
        };

        const computeRowHeight = (row) => {
          let result = 0;
          let cellp;

          // if row is object, content with property and options
          if (
            !Array.isArray(row) &&
            typeof row === "object" &&
            !row.hasOwnPropert("property")
          ) {
            // Not implemented
            console.log("not array");
          }

          console.log("row:", row);

          row.forEach((cell, i) => {
            let text = cell;

            // object
            // read cell and get label of object
            //@ Not implemented
            if (typeof cell === "object") {
              console.log("cell.label:", cell.label);
              text = String(cell.label);
            }

            text = String(text).replace("bold:", "").replace("size", "");

            // cell padding
            cellp = prepareCellPadding(
              table.headers[i].padding || options.padding || 0
            );

            // calc height size of string
            const cellHeight = this.heightOfString(text, {
              width: columnSizes[i] - (cellp.left + cellp.right),
              align: "left",
            });

            result = Math.max(result, cellHeight);
            console.log("result:", result);
          });

          return result + columnSpacing;
        };

        // Header

        const addHeader = () => {
          // Allow the user to override style for headers
          prepareHeader();

          // calc header height
          if (this.headerHeight === 0) {
            this.headerHeight = computeRowHeight(table.headers);
            console.log("this.headerHeight:", this.headerHeight);
          }

          // calc first table line when init table
          if (this.firstLineHeight === 0) {
            if (table.datas.length > 0) {
              // TODO implement
            } else if (table.rows.length > 0) {
              this.firstLineHeight = computeRowHeight(table.rows[0]);
              console.log("this.firstLineHeight", this.firstLineHeight);
            }
          }

          // 24.1 is height calc title + subtitle
        };

        addHeader();

        console.log("options.x", options.x);
        console.log("options.y", options.y);
        console.log("this.x:", this.x);
        console.log("this.y:", this.y);
        console.log("marginLeft:", this.page.margins.left);
        console.log("marginTop:", this.page.margins.top);
        console.log("startX:", startX);
        console.log("startY:", startY);
        console.log(table);
      } catch (error) {
        console.log(error);
      }
    });
  }
  async tables(tables, callback) {
    return new Promise((resolve, reject) => {
      try {
        Array.isArray(tables)
          ? tables.forEach(async (table) => {
              try {
                await this.table(table, table.options || {});
              } catch (error) {
                console.log(error);
              }
            })
          : console.log("Not Array");
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFDocumentWithTable;
