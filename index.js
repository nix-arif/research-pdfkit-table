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

        const title = table.title ? table.title : options.title || "arif";
        console.log("table.title:", table.title);
        console.log("options.title:", title);

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
