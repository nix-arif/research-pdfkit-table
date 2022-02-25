const fs = require("fs");
const PDFDocument = require("./index");

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream("test.pdf"));

try {
  doc.tables([
    {
      name: "arif",
      headers: ["name", "age"],
      options: {
        padding: 0,
      },
    },
  ]);
} catch (error) {
  console.log(error);
}

doc.end();

// headers: [
//   {
//     label: "name",
//     padding: [0, 0, 0, 0],
//   },
// ],
