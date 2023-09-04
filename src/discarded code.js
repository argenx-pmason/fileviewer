    // processXmlFile = (file) => {
    //   setWaitGetDir(true);
    //   fetch(file).then(function (response) {
    //     // console.log(response);
    //     response.text().then(function (text) {
    //       setOriginalContent(text);
    //       const jsonText = xml2json(text, {
    //           ignoreComment: true,
    //           // alwaysChildren: true,
    //           trim: true,
    //           spaces: 3,
    //         }),
    //         json = JSON.parse(jsonText);
    //       descend(json, 0);
    //       processTempRows();
    //       console.log("xmlRows", xmlRows);
    //       setFileType("xml");
    //       setWaitGetDir(false);
    //     });
    //   });
    // },
    // tempRows = [],
    // descend = (ob, level) => {
    //   const next = level + 1;
    //   // console.log(ob, level);
    //   const keys = Object.keys(ob);
    //   keys.forEach((k) => {
    //     tempRows.push([level, k]);
    //     if (typeof ob[k] === "object") descend(ob[k], level + 1);
    //     else tempRows.push([next, ob[k]]);
    //   });
    // },
    // [xmlRows, setXmlRows] = useState(null),
    // [xmlCols, setXmlCols] = useState(null),
    // processTempRows = () => {
    //   // console.log("tempRows", tempRows);
    //   // const tempRows2 = tempRows.slice(0, 22);
    //   const max = tempRows.length - 1;
    //   let currentRow = {};
    //   xmlMaxCol = 0; // maximum column number in XML array
    //   const tempXmlRows = [];
    //   tempRows.forEach((tr, i) => {
    //     const nextCol = i < max ? tempRows[i + 1][0] : 0,
    //       thisCol = tr[0];
    //     if (thisCol > xmlMaxCol) xmlMaxCol = thisCol;
    //     // console.log(thisCol, nextCol, tr);
    //     currentRow[thisCol] = tr[1];
    //     // console.log(currentRow);
    //     if (thisCol > nextCol) {
    //       tempXmlRows.push({ id: i, ...currentRow }); // write current row
    //       // prepare row by only keeping higher level keys than the next one
    //       Object.keys(currentRow).forEach((k) => {
    //         if (k > nextCol) delete currentRow[k];
    //       });
    //     }
    //   });
    //   // define columns for xmlRows table
    //   const tempXmlCols = Array.from({ length: xmlMaxCol + 1 }, (_, i) => ({
    //     field: String(i),
    //     headerName: utils.encode_col(i),
    //   }));
    //   console.log("tempXmlCols", tempXmlCols);
    //   setXmlCols(tempXmlCols);
    //   setXmlRows(tempXmlRows);
    // },
    // handleXmlClick = (params) => {
    //   const { value } = params;
    //   console.log(value, "fileDirectory", fileDirectory);
    //   // check if value looks like it could be used to view a file
    //   if (value.startsWith("/")) {
    //     // handle absolute paths
    //     window.open(fileViewerPrefix + value, "_blank");
    //   }
    //   if (value.startsWith("../")) {
    //     // handle relative paths
    //     const prefix0 = fileDirectory.split("/");
    //     prefix0.pop();
    //     const prefix = prefix0.join("/");
    //     window.open(fileViewerPrefix + prefix + value.substring(2), "_blank");
    //   }
    //   if (value.startsWith("./")) {
    //     window.open(
    //       fileViewerPrefix + fileDirectory + value.substring(1),
    //       "_blank"
    //     );
    //   }
    // },