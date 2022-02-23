const PDFDocument = require("./index");

const doc = new PDFDocument();

try {
  doc.tables([{ name: "arif", headers: ["name", "age"] }]);
} catch (error) {
  console.log(error);
}
