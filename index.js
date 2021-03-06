const PDFDocument = require("pdfkit");
const EventEmitter = require("events").EventEmitter;

// custom console.log

["log", "warn", "error"].forEach((methodName) => {
  const originalMethod = console[methodName];
  console[methodName] = (...args) => {
    try {
      throw new Error();
    } catch (error) {
      originalMethod.apply(console, [
        ...args,
        "\t\t",
        error.stack // Grabs the stack trace
          .split("\n")[2] // Grabs third line
          .trim() // Removes spaces
          .substring(3) // Removes three first characters ("at ")
          .replace(__dirname, "") // Removes script folder path
          .replace(/\s\(./, " at ") // Removes first parentheses and replaces it with " at "
          .replace(/\)/, ""), // Removes last parentheses
      ]);
    }
  };
});

////////////////////////////////////////////////////////////////////////

class PDFDocumentWithTable extends PDFDocument {
  constructor(option) {
    super(option);
    this.emitter = new EventEmitter();
  }

  /**
   * addBackground
   * @param {Object} rect
   * @param {String} fillColor
   * @param {Number} fillOpacity
   * @param {Function} callback
   */
  addBackground({ x, y, width, height }, fillColor, fillOpacity, callback) {
    // validate
    fillColor || (fillColor = "grey");
    fillOpacity || (fillOpacity = 0.1);

    // save current style
    this.save();

    // draw bg
    this.fill(fillColor)
      // .stroke(fillColor)
      .fillOpacity(fillOpacity)
      .rect(x, y, width, height)
      // .stroke()
      .fill();
  }

  /**
   * table
   * @param {Object} table
   * @param {Object} options
   * @param {Function} callback
   */

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
          } // TODO else
        };

        // add a new page before create table
        options.addPage === true && this.emitter.emit("addPage");

        // event emitter
        const onFirePageAdded = () => {
          // startX = this.page.margins.left
          startY = this.page.margins.top;
          rowBottomY = 0;
          this.addPage();
          addHeader();
        };

        // add fire
        this.emitter.removeAllListeners();
        this.emitter.on("addPage", onFirePageAdded);

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
            console.log("cell:", cell);

            // object
            // read cell and get label of object
            //@ Not implemented
            if (typeof cell === "object") {
              console.log("cell.label:", cell.label);
              text = String(cell.label);
            }

            text = String(text).replace("bold:", "").replace("size", "");

            // cell padding
            console.log("table.headers:", table.headers[i]);
            console.log("table.headers[i].padding:", table.headers[i].padding);
            cellp = prepareCellPadding(
              table.headers[i].padding || options.padding || 0
            );

            console.log("cellp:", cellp);

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

        // Calc columns size

        const calcColumnSizes = () => {
          let h = []; // header width
          let p = []; // position
          let w = 0; // table width

          // (table width) 1o - Max size table
          w =
            this.page.width -
            this.page.margins.right -
            (options.x || this.page.margins.left);
          // (table width) 2o - Size defined
          options.width &&
            (w = String(options.width).replace(/[^0-9]/g, "") >> 0);

          // (table width) if table is percent of page

          // (size columns) 1o
          table.headers.forEach((el) => {
            el.width && h.push(el.width); // - column spacing
          });

          // (size columns) 2o
          if (h.length === 0 && options.columnSizes !== undefined) {
            // added option.columnSizes !== undefined check
            h = options.columnSizes;
          }

          // (size columns) 3o
          if (h.length === 0) {
            columnWidth = w / table.headers.length; // - columnSpacing // define column width
            table.headers.forEach(() => h.push(columnWidth));
          }

          console.log(h);

          // Set columnPositions
          h.reduce((prev, curr, indx) => {
            p.push(prev >> 0);
            return prev + curr;
          }, options.x || this.page.margins.left);

          // !Set columnSizes
          h.length && (columnSizes = h);
          p.length && (columnPositions = p);

          // (table width) 3o - Sum last position + last header width
          w = p[p.length - 1] + h[h.length - 1];

          // !Set tableWidth
          w && (tableWidth = w);
        };

        calcColumnSizes();

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
          console.log("titleHeight:", this.titleHeight);
          console.log("lockAddTitles:", this.lockAddTitles);
          this.titleHeight = !this.lockAddTitles ? 24.1 : 0;
          console.log("titleHeight:", this.titleHeight);
          //calc if header + first line fit on last page
          const calc =
            startY +
            this.titleHeight +
            this.firstLineHeight +
            this.headerHeight +
            this.safelyMarginBottom;

          // content is big text (crazy!)
          if (this.firstLineHeight > maxY) {
            this.lockAddPage = true;
          } else if (calc > maxY) {
            this.lockAddPage = true;
            this.emitter.emit("addPage");
            return;
          }

          ////////////TODO-------------------
          //////Many-------------------------
          ///////////////////////////////////

          if (table.headers.length > 0) {
            // simple header
            if (typeof table.headers[0] === "string") {
              table.headers.forEach((header, i) => {
                // background header
                const rectCell = {
                  x: lastPositionX,
                  y: startY - columnSpacing - rowDistance * 2,
                  width: columnSizes[i],
                  height: this.headerHeight + columnSpacing,
                };

                // add background
                this.addBackground(rectCell);

                // cell padding
                cellPadding = prepareCellPadding(options.padding || 0);

                this.fillColor("black")
                  .fillOpacity(1)
                  .text(header, lastPositionX + cellPadding.left, startY, {
                    width:
                      Number(columnSizes[i]) -
                      (cellPadding.left + cellPadding.right),
                    align: "left",
                  });

                lastPositionX += columnSizes[i] >> 0;
                console.log("lastPositionX", lastPositionX);
              });
            }
          }
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
        console.log(options);
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
