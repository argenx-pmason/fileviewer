import React, { useState, useEffect, createRef } from "react";
import {
  Grid,
  Box,
  Tooltip,
  IconButton,
  AppBar,
  // Container,
  Toolbar,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add,
  Remove,
  ContentCopy,
  Download,
  FolderOpen,
  RestartAlt,
  ZoomOut,
  ZoomIn,
  Height,
  // Link,
  ArrowDropDown,
  ArrowDropUp,
  ArrowCircleUp,
  Compress,
  Expand,
} from "@mui/icons-material";
// import {DataGrid } from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
// libraries supporting different file types
import Select from "react-select";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import Highlight from "react-highlight";
// import hljs from "highlight.js";
import { read, utils } from "xlsx";
// import { xml2json } from "xml-js";
// shared functions
import { getDir, xmlToJson } from "./utility";
// CSS
import "highlight.js/styles/googlecode.css";
import "./App.css";
// local test sources
import test_lst from "./test/test.lst";
import test_txt from "./test/test.txt";
import test_pdf from "./test/test.pdf";
// import test_doc from "./test/test.docx";
// import test_ppt from "./test/test.pptx";
import test_xlsx from "./test/test.xlsx";
import test1_xlsx from "./test/test1.xlsx";
import test3_xlsx from "./test/test3.xlsx";
import test_svg from "./test/test.svg";
import test_png from "./test/test.png";
import test_jpg from "./test/test.jpg";
import test_job from "./test/test.job";
import test_json from "./test/test.json";
import test_mnf from "./test/test.mnf";
import test_sas from "./test/test.sas";
import test_csv from "./test/test.csv";
import test_nosuffix from "./test/nosuffix";

export default function App() {
  LicenseInfo.setLicenseKey(
    "5b931c69b031b808de26d5902e04c36fTz00Njk0NyxFPTE2ODg4MDI3MDM3MjAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );
  let pageNumber = 1;

  // xmlMaxCol = 0;
  const urlPrefix = window.location.protocol + "//" + window.location.host,
    { href } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    server = href.split("//")[1].split("/")[0],
    [showLeftPanel, setShowLeftPanel] = useState(1),
    buttonBackground = "#e8e8e8",
    increment = 20, // pixels to change height of content by
    fileRef = createRef(),
    [windowDimension, detectHW] = useState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    }),
    [fileDirectory, setFileDirectory] = useState("/clinical/"),
    [showPageBreaks, setShowPageBreaks] = useState(true),
    [alternateLayout, setAlternateLayout] = useState(true),
    [downloadSome, setDownloadSome] = useState(true),
    detectSize = () => {
      detectHW({
        winWidth: window.innerWidth,
        winHeight: window.innerHeight,
      });
    },
    [fontSize, setFontSize] = useState(12),
    iconPadding = 0.1,
    [imageDelta, setImageDelta] = useState(0),
    [content, setContent] = useState(null),
    // [options] = useState(null),
    // [selectedOption, setSelectedOption] = useState(""),
    [url, setURL] = useState(null),
    [fileName, setFileName] = useState(null),
    [fileType, setFileType] = useState(null),
    [thisIsADir, setThisIsADir] = useState(null),
    [fileViewerType, setFileViewerType] = useState(null),
    [rows, setRows] = useState([null]),
    [cols, setCols] = useState(null),
    [pdfFile, setPdfFile] = useState(null),
    // [pptFile, setPptFile] = useState(null),
    // [docFile, setDocFile] = useState(null),
    [imageFile, setImageFile] = useState(null),
    [fitHeight, setFitHeight] = useState(undefined),
    [page] = useState(1),
    [waitGetDir, setWaitGetDir] = useState(false),
    [waitSelectFile, setWaitSelectFile] = useState(false),
    [, setSelection] = useState(null),
    [selectedFile, setSelectedFile] = useState(null),
    [selectedSheet, setSelectedSheet] = useState(null),
    [sheetOptions, setSheetOptions] = useState(null),
    [showSheetSelector, setShowSheetSelector] = useState(null),
    logViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/logviewer/index.html?log=`,
    fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=`,
    // officeFileViewerPrefix =
    //   "https://view.officeapps.live.com/op/view.aspx?src=",
    // user selects file from list of files loaded from directory
    cantViewTheseFileTypes = [
      "docx",
      "doc",
      "pptx",
      "ppt",
      "sas7bdat",
      "zip",
      "ico",
      "jar",
      "gz",
    ], // list of file types that we can't yet view in the browser properly
    openTheseFileTypesNow = [
      "html",
      "htm",
    ], // list of file types that we want to open in a new tab when selected
    selectFile = (index) => {
      setWaitSelectFile(true);
      // console.log(index);
      const { value, fileType } = index;
      // console.log(index, fileType, downloadSome, cantViewTheseFileTypes);
      // check file type against list of ones we want to download
      if (downloadSome && cantViewTheseFileTypes.includes(fileType)) {
        // download file rather than view it
        console.log("downloading file: ", value, fileName);
        downloadFile(value, fileName);
      } else
        if (downloadSome && openTheseFileTypesNow.includes(fileType)) {
          // download file rather than view it
          console.log("open in new tab file: ", value, fileName);
          openInNewTab(`${value}`);
        } else {
          // eslint-disable-next-line
        getFile(value);
        document.title = value.split("/").pop();
        setSelectedFile(index);
        setSelection(value);
        setURL(value);
      }
      setWaitSelectFile(false);
    },
    // user selects excel file sheet from list of sheets loaded from excel file
    selectSheet = (index) => {
      setWaitSelectFile(true);
      const { value } = index;
      // console.log("index", index);
      setSelectedSheet(index);
      processExcel(currentExcelResp, value); // get the rows and cols for the selected sheet
      setWaitSelectFile(false);
    },
    openInNewTab = (url) => {
      const win = window.open(url, "_blank");
      win.focus();
    },
    downloadFile = (url, filename) =>
      Object.assign(document.createElement("a"), {
        href: url,
        download: filename,
      }).click(),
    processText = (file, ft) => {
      setWaitGetDir(true);
      fetch(file).then(function (response) {
        // console.log(response);
        response.text().then(async function (text) {
          // console.log("ft", ft);
          setOriginalContent(text);
          setWaitGetDir(false);
          setContent(text);
          const newText = analyse(text);
          const delay = (ms) => new Promise((res) => setTimeout(res, ms));
          await delay(5000);
          setContent(newText);
          setFileViewerType(ft);
          setFileType("txt");
        });
      });
    },
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
    [topSpace, setTopSpace] = useState(160),
    [currentExcelResp, setCurrentExcelResp] = useState(null),
    processExcel = (resp, sheetNumber = 0) => {
      setCurrentExcelResp(resp);
      const wb = read(resp);
      // console.log("wb", wb);
      const tempSheetOptions = wb.SheetNames.map((s, i) => {
        return { value: i, label: s };
      });
      if (wb.SheetNames.length > 1) {
        setShowSheetSelector(true);
        setSelectedSheet(tempSheetOptions[sheetNumber]);
      } else setShowSheetSelector(false);
      setSheetOptions(tempSheetOptions);
      const workSheet = wb.Sheets[wb.SheetNames[sheetNumber]],
        tempRows = utils.sheet_to_json(workSheet, { header: 1 }).map((r, i) => {
          r.id = i;
          return r;
        }),
        range = utils.decode_range(workSheet["!ref"] || "A1"),
        tempCols = Array.from({ length: range.e.c + 1 }, (_, i) => ({
          field: String(i), // MUIDG will access row["0"], row["1"], etc
          headerName: utils.encode_col(i), // the column labels will be A, B, etc
        }));
      setRows(tempRows);
      setCols(tempCols);
      setFileType("excel");
      // console.log(tempRows, tempCols);
    },
    // processMnf = () => {
    //   const jsonText = xml2json(content, {
    //       ignoreComment: true,
    //       // alwaysChildren: true,
    //       trim: true,
    //       spaces: 3,
    //     }),
    //     json = JSON.parse(jsonText),
    //     elements = json.elements[0].elements,
    //     feedback = [];
    //   console.log("elements", elements);
    //   elements.forEach((element) => {
    //     let chunk = "",
    //       path = "",
    //       file = "";
    //     chunk += "<b><i>" + element.name + "</i></b> - ";
    //     switch (element.name) {
    //       case "inputs":
    //       case "outputs":
    //         chunk += element.elements.length + ` ${element.name}<br/>`;
    //         element.elements.forEach((e) => {
    //           if (e.name === "file") {
    //             path =
    //               e.attributes && e.attributes.uri
    //                 ? e.attributes.uri.slice(6)
    //                 : null;
    //             file = path ? path.split("?")[0].split("/").pop() : null;
    //             chunk += file
    //               ? `<a href='${
    //                   fileViewerPrefix + path
    //                 }' target='_blank'>${file}</a><br/>`
    //               : null;
    //           }
    //         });
    //         chunk += "<br/>";
    //         break;
    //       case "job":
    //       case "lst":
    //         path =
    //           element.attributes && element.attributes.uri
    //             ? element.attributes.uri.slice(6)
    //             : null;
    //         file = path ? path.split("?")[0].split("/").pop() : null;
    //         chunk += file
    //           ? `<a href='${
    //               fileViewerPrefix + path
    //             }' target='_blank'>${file}</a><br/>`
    //           : "";
    //         break;
    //       case "log":
    //         path =
    //           element.attributes && element.attributes.uri
    //             ? element.attributes.uri.slice(6)
    //             : null;
    //         file = path ? path.split("?")[0].split("/").pop() : null;
    //         chunk += file
    //           ? `<a href='${
    //               logViewerPrefix + path
    //             }' target='_blank'>${file}</a><br/>`
    //           : "";
    //         break;
    //       default:
    //     }
    //     feedback.push(chunk + "<p/>");
    //   });
    //   const allFeedback = feedback.join("<br/>");
    //   setFileType("html");
    //   setContent(allFeedback);
    // },
    getFile = (url) => {
      // console.log(url);
      // local mode for test and development
      if (mode === "local") {
        if (url === "test_lst") processText(test_lst, "txt");
        else if (url === "test_txt") processText(test_txt, "txt");
        else if (url === "test_nosuffix") processText(test_nosuffix, "txt");
        else if (url === "test_sas") processText(test_sas, "sas");
        // else if (url === "test_job") processXmlFile(test_job);
        // else if (url === "test_mnf") processXmlFile(test_mnf);
        else if (url === "test_job") processText(test_job, "xml");
        else if (url === "test_mnf") processText(test_mnf, "xml");
        else if (url === "test_json") processText(test_json, "json");
        else if (url === "test_xlsx") {
          fetch(test_xlsx).then((response) => {
            response.arrayBuffer().then((resp) => {
              processExcel(resp);
            });
          });
        } else if (url === "test1_xlsx") {
          fetch(test1_xlsx).then((response) => {
            // console.log(response);
            response.arrayBuffer().then((resp) => {
              processExcel(resp);
            });
          });
        } else if (url === "test3_xlsx") {
          fetch(test3_xlsx).then((response) => {
            // console.log(response);
            response.arrayBuffer().then((resp) => {
              processExcel(resp);
            });
          });
        } else if (url === "test_csv") {
          fetch(test_csv).then((response) => {
            // console.log(response);
            response.arrayBuffer().then((resp) => {
              processExcel(resp);
            });
          });
        } else if (url === "test_pdf") {
          setPdfFile(test_pdf);
          setFileType("pdf");
          // } else if (url === "test_doc") {
          //   setDocFile(test_doc);
          //   setFileType("doc");
          // } else if (url === "test_ppt") {
          //   setPptFile(test_ppt);
          //   setFileType("ppt");
        } else if (url === "test_svg") {
          setImageFile(test_svg);
          setFileType("image");
        } else if (url === "test_png") {
          setImageFile(test_png);
          setFileType("image");
        } else if (url === "test_jpg") {
          setImageFile(test_jpg);
          setFileType("image");
        } else {
          fetch(url).then(function (response) {
            response.text().then(function (text) {
              setOriginalContent(text);
              const newText = analyse(text);
              setContent(newText);
              setFileType("other");
              setFileViewerType("txt");
            });
          });
        }
      } else {
        // remote mode
        const splitDots = url.split("/").pop().split(".");
        let tempFileType;
        if (splitDots.length > 1) tempFileType = splitDots[1].split("?")[0];
        else tempFileType = splitDots.pop();
        // ,isDirectory = [0, 1].includes(splitDots.length);
        // setFileType(tempFileType);
        console.log(
          "tempFileType",
          tempFileType,
          "url",
          url,
          "splitDots",
          splitDots
        );
        if (["xlsx", "csv"].includes(tempFileType)) {
          setWaitGetDir(true);
          // setFileType("excel");
          fetch(url).then((response) => {
            // console.log("response", response);
            response.arrayBuffer().then((resp) => {
              // console.log("resp", resp);
              processExcel(resp);
              setWaitGetDir(false);
            });
          });
        } else if (["pdf"].includes(tempFileType)) {
          setPdfFile(url);
          setFileType("pdf");
          // } else if (["job", "mnf"].includes(tempFileType)) {
          //   processXmlFile(url);
          // } else if (["doc"].includes(tempFileType)) {
          //   setDocFile(url);
          //   setFileType("doc");
          // } else if (["ppt"].includes(tempFileType)) {
          //   setPptFile(url);
          //   setFileType("ppt");
        } else if (["png", "svg", "jpg"].includes(tempFileType)) {
          setImageFile(url);
          setFileType("image");
        } else {
          if (splitDots.length > 0 || thisIsADir === false) {
            setWaitGetDir(true);
            // process file depending on file type
            fetch(url).then(function (response) {
              response.text().then(function (text) {
                setOriginalContent(text);
                const newText = analyse(text);
                setContent(newText);
                setFileType("txt");
                setFileViewerType(tempFileType);
                setWaitGetDir(false);
              });
            });
          }
        }
      }
    },
    getWebDav = async (dir) => {
      const webDavPrefix = urlPrefix + "/lsaf/webdav/repo";
      if (mode === "local") {
        setListOfFiles([
          { id: 0, value: "test_pdf", label: "PDF" },
          { id: 1, value: "test_xlsx", label: "Excel (xlsx)" },
          { id: 2, value: "test1_xlsx", label: "Excel multi-sheet 1 (xlsx)" },
          { id: 3, value: "test3_xlsx", label: "Excel multi-sheet 2 (xlsx)" },
          { id: 4, value: "test_csv", label: "Excel (csv)" },
          { id: 5, value: "test_png", label: "Image (png)" },
          { id: 6, value: "test_svg", label: "Image (svg)" },
          { id: 7, value: "test_jpg", label: "Image (jpg)" },
          { id: 8, value: "test_lst", label: "Text (lst)" },
          { id: 9, value: "test_txt", label: "Text (txt)" },
          { id: 10, value: "test_sas", label: "Text (sas)" },
          { id: 11, value: "test_json", label: "Text (json)" },
          { id: 12, value: "test_mnf", label: "Text (mnf)" },
          { id: 13, value: "test_job", label: "Text (job)" },
          { id: 14, value: "test_doc", label: "Word (docx)" },
          { id: 15, value: "test_nosuffix", label: "Text (no suffix)" },
          // { id: 15, value: "test_ppt", label: "PowerPoint (ppt)" },
        ]);
      } else await getDir(webDavPrefix + dir, 1, processXml);
      setWaitGetDir(false);
    },
    // [pageNumber, setPageNumber] = useState(0),
    [listOfFiles, setListOfFiles] = useState(null),
    analyse = (text) => {
      const pageCount = (match, offset, string) => {
          pageNumber++;
          return (
            "\n\n" +
            "=".repeat(64) +
            "> Page " +
            pageNumber +
            " <" +
            "=".repeat(64) +
            "\n\n\n"
          );
        },
        // pagebreak1 = "\n" + "-".repeat(50) + `> Page ${page}<` + "-".repeat(50) + "\n\n",
        pagebreak2 = "\n\n",
        newText = text.replace(/\f/gm, showPageBreaks ? pageCount : pagebreak2);
      return newText;
    },
    [originalContent, setOriginalContent] = useState(""),
    processXml = (responseXML) => {
      // Here you can use the Data
      let dataXML = responseXML;
      let dataJSON = xmlToJson(dataXML.responseXML);
      // if its not an array then we are not at a valid directory
      if (
        dataJSON["d:multistatus"]["d:response"].constructor.name !== "Array"
      ) {
        console.log("dataJSON", dataJSON);
        setThisIsADir(false);
        return;
      }
      setThisIsADir(true);
      const files = dataJSON["d:multistatus"]["d:response"].map((record) => {
        // console.log("record", record);
        let path = record["d:href"]["#text"],
          isDirectory = Array.isArray(record["d:propstat"]),
          props = record["d:propstat"]["d:prop"],
          dirProps = record["d:propstat"][0]
            ? record["d:propstat"][0]["d:prop"]
            : undefined;
        if (props === undefined) {
          if (dirProps === undefined) return null;
          else props = dirProps;
        }
        const name = props["d:displayname"]["#text"] ?? "",
          created = props["d:creationdate"]
            ? props["d:creationdate"]["#text"]
            : null,
          modified = props["d:getlastmodified"]
            ? props["d:getlastmodified"]["#text"]
            : null,
          checkedOut = props["ns1:checkedOut"]
            ? props["ns1:checkedOut"]["#text"]
            : null,
          locked = props["ns1:locked"] ? props["ns1:locked"]["#text"] : null,
          version = props["ns1:version"] ? props["ns1:version"]["#text"] : null,
          fileType = path.split(".").pop(),
          partOfFile = {
            value: urlPrefix + path,
            fileType: fileType,
            label: name,
            created: created,
            modified: modified,
            checkedOut: checkedOut,
            locked: locked,
            version: version,
            isDirectory: isDirectory,
          };
        return partOfFile;
      });
      setListOfFiles(
        files
          .filter((f) => f !== null && !f.isDirectory)
          .sort((a, b) => {
            const x = a.label.toLowerCase(),
              y = b.label.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          })
          .map((r, id) => {
            r.id = id;
            return r;
          })
      );
      const tempListOfDirs = files
        .filter((f) => f !== null && f.isDirectory)
        .slice(1)
        .sort((a, b) => {
          const x = a.label.toLowerCase(),
            y = b.label.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

      // console.log("files", files);
      const numberOfFilesFound = files.filter(
          (f) => f !== null && !f.isDirectory
        ).length,
        numberOfDirsFound = tempListOfDirs.length;
      // setSelectedOption("");
      let chunk = "";
      chunk +=
        numberOfFilesFound +
        " files and " +
        numberOfDirsFound +
        " directories found when reading directory." +
        "<p/>" +
        "<table><tr><th>Directory</th><th>Last Modified</th></tr>";
      tempListOfDirs.forEach((d) => {
        chunk +=
          "<tr>" +
          `<td><a href='${fileViewerPrefix}${d.value.slice(
            49
          )}' target='_self'>${d.label}</a></td><td>${d.modified}</td>` +
          "</tr>";
      });
      chunk += "</table>";
      setFileType("html");
      // console.log("chunk", chunk);
      setOriginalContent(chunk);
      setContent(chunk);
    };
  // experimentOptions = {
  //   method: "put",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "X-CSRF-TOKEN": "41d6dd33-cfa1-4a6d-9cfc-77e821ce6ec1",
  //   },
  //   body: JSON.stringify({
  //     path: "/general/biostat/gadam/documents/gadam_dshb/adam_msg.sas7bdat",
  //     location: "REPOSITORY",
  //     version: null,
  //     refresh: true,
  //     includeInfo: true,
  //     start: 0,
  //     limit: 1000,
  //   }),
  // };
  // experiment = () => {
  //   fetch(
  //     "https://xarprod.ondemand.sas.com/lsaf/rest/dataview/278b7216-e082-4452-9c20-e85fa1298a19/data",
  //     experimentOptions
  //   ).then((response) => {
  //     console.log("response", response);
  //   });
  // };
  // Iframe = (src) => {
  //   console.log("src", src);
  //   if (!src) {
  //     return <div>Loading...</div>;
  //   }
  //   return (
  //     // <div className="col-md-12">
  //     //   <div className="emdeb-responsive">
  //     <iframe src={src} title="doc-viewer"></iframe>
  //     //   </div>
  //     // </div>
  //   );
  // };

  // console.log("href", href, "server", server);

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => {
      window.removeEventListener("resize", detectSize);
    };
  }, [windowDimension]);

  useEffect(() => {
    // console.log("thisIsADir", thisIsADir);
    if (thisIsADir === false) {
      console.log("this might be a file since it is not a dir");
      getFile(url);
      setFileViewerType("txt");
    }
    // eslint-disable-next-line
  }, [thisIsADir]);

  useEffect(() => {
    if (mode === "local") return;
    const splitQuestionMarks = href.split("?"),
      urlPrefix = window.location.protocol + "//" + window.location.host,
      filePrefix = "/lsaf/filedownload/sdd%3A//";
    if (splitQuestionMarks.length > 1) {
      const splitEquals = splitQuestionMarks[1].split("="),
        partialFile = splitEquals[1],
        file = partialFile.startsWith("http")
          ? partialFile
          : urlPrefix + filePrefix + partialFile,
        tempFileName = file.split("/").pop(),
        tempFileType = tempFileName.split(".").pop(),
        version =
          splitQuestionMarks.length > 2 ? "?" + splitQuestionMarks[2] : null,
        fileWithVersion = version ? file + version : file;
      document.title = tempFileName;
      setURL(fileWithVersion);
      getFile(fileWithVersion);
      setFileName(tempFileName);
      setFileType(tempFileType);
      // console.log(tempFileName, tempFileType);
      setFileViewerType(
        ["job", "mnf"].includes(tempFileType) ? "xml" : tempFileType
      );
      // set the directory to that of the file which was passed in
      const fileSplit = file.split("%3A");
      // console.log("fileSplit", fileSplit);
      const fileDirBits =
        fileSplit.length > 1
          ? fileSplit[1].split("?")[0].split("/")
          : fileSplit[0].split("/");
      fileDirBits.pop();
      const tempFileDir = fileDirBits.filter((element) => element),
        fileDir = tempFileDir.join("/");
      // Assumption: if filename has a . then it is a file, but if not it is a directory
      // console.log(tempFileName.split(".").length);

      // look for lsaf/webdav/repo and then use substring to just get the path within lsaf from /general or /clinical
      const ind =
        fileDir.indexOf("lsaf/webdav/repo") +
        fileDir.indexOf("lsaf/webdav/work");
      let short = fileDir;
      if (ind > 0) short = fileDir.substring(ind + 17);
      // console.log(
      //   "file",
      //   file,
      //   "fileDirBits",
      //   fileDirBits,
      //   "fileDir",
      //   fileDir,
      //   "partialFile",
      //   partialFile,
      //   "urlPrefix",
      //   urlPrefix,
      //   "filePrefix",
      //   filePrefix,
      //   "ind",
      //   ind,
      //   "tempFileName",
      //   tempFileName,
      //   "short",
      //   short,
      //   'tempFileName.split(".").length',
      //   tempFileName.split(".").length
      // );

      if (tempFileName.split(".").length === 1) {
        setFileDirectory("/" + short + "/" + tempFileName);
        getWebDav("/" + short + "/" + tempFileName);
      } else {
        if (short.startsWith("/")) {
          setFileDirectory(short);
          getWebDav(short);
        } else {
          setFileDirectory("/" + short);
          getWebDav("/" + short);
        }
      }
    } else {
      // console.log(mode, fileDirectory);
      getWebDav(fileDirectory);
      // fetch(test_lst)
      //   .then((r) => r.text())
      //   .then((r) => {
      //     setOriginalContent(r);
      //     const newText = analyse(r);
      //     setContent(newText);
      //   });
    }
    // eslint-disable-next-line
  }, [href]);

  useEffect(() => {
    if (originalContent === "") return;
    const newText = analyse(originalContent);
    if (newText.length > 0) setContent(newText);
    // eslint-disable-next-line
  }, [showPageBreaks]);

  // if we are in a frame, then dont show the left panel which allows loading directories and other files
  useEffect(() => {
    // console.log(
    //   "fileRef",
    //   fileRef,
    //   window.self !== window.top,
    //   "window.self",
    //   window.self,
    //   "window.top",
    //   window.top
    // );
    if (window.self !== window.top) setShowLeftPanel(false);
    else setShowLeftPanel(true);
  }, [fileRef]);

  // console.log(
  //   "fileType",
  //   fileType,
  //   "fileViewerType",
  //   fileViewerType,
  //   "fileDirectory",
  //   fileDirectory,
  //   "selectedFile",
  //   selectedFile,
  //   "docFile",
  //   docFile
  // );

  return (
    <Box>
      <Grid container>
        {
          <>
            <AppBar
              position="static"
              sx={{
                bgcolor: "background.paper",
                color: "text.secondary",
                m: 0,
              }}
            >
              {/* <Container> */}
              <Toolbar disableGutters variant="dense" sx={{ m: 0.5 }}>
                <Grid item>
                  {/* <Box
                      variant={"dense"}
                      sx={{
                        bgcolor: "background.paper",
                        color: "text.secondary",
                      }}
                    > */}
                  <Tooltip title="Reduce size of font">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFontSize(fontSize - 1);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset to 12">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFontSize(12);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Increase size of font">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFontSize(fontSize + 1);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download File">
                    <IconButton
                      size="small"
                      onClick={() => {
                        downloadFile(url, fileName);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton
                      size="small"
                      onClick={() => {
                        openInNewTab(`${url}`);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <FolderOpen fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy content">
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(content);
                      }}
                      sx={{
                        backgroundColor: buttonBackground,
                        padding: iconPadding,
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {listOfFiles && listOfFiles.length > 0 && (
                    <Tooltip title="Show previous file">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const id = selectedFile ? selectedFile.id : 1,
                            newId = id === 0 ? id : id - 1;
                          // console.log(listOfFiles, selectedFile, id, newId);
                          if (id !== newId) selectFile(listOfFiles[newId]);
                        }}
                        sx={{
                          backgroundColor: buttonBackground,
                          padding: iconPadding,
                        }}
                      >
                        <ArrowDropUp fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {listOfFiles && listOfFiles.length > 0 && (
                    <Tooltip title="Show next file">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const id = selectedFile ? selectedFile.id : -1,
                            length = listOfFiles.length,
                            newId = id === length - 1 ? id : id + 1;
                          // console.log(listOfFiles, selectedFile, id, newId, length);
                          if (id !== newId) selectFile(listOfFiles[newId]);
                        }}
                        sx={{
                          backgroundColor: buttonBackground,
                          padding: iconPadding,
                        }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {["image", "pdf", "svg", "jpg", "png"].includes(fileType) && (
                    <Tooltip title="Zoom out (images and PDFs)">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setImageDelta(imageDelta - 250);
                        }}
                        sx={{
                          backgroundColor: buttonBackground,
                          padding: iconPadding,
                        }}
                      >
                        <ZoomOut fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {["image", "pdf", "svg", "jpg", "png"].includes(fileType) && (
                    <Tooltip title="Reset to fit width">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setImageDelta(0);
                        }}
                        sx={{
                          backgroundColor: buttonBackground,
                          padding: iconPadding,
                        }}
                      >
                        <RestartAlt fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {["image", "pdf", "svg", "jpg", "png"].includes(fileType) && (
                    <Tooltip title="Zoom in (images and PDFs)">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setImageDelta(imageDelta + 250);
                        }}
                        sx={{
                          backgroundColor: buttonBackground,
                          padding: iconPadding,
                        }}
                      >
                        <ZoomIn fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {["image", "svg", "jpg", "png"].includes(fileType) && (
                    <Tooltip title="Toggle fitting image to height">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setFitHeight(
                            fitHeight === undefined ? true : !fitHeight
                          );
                        }}
                        sx={{
                          backgroundColor: fitHeight ? "#e3f2fd" : "#e8e8e8",
                          padding: iconPadding,
                        }}
                      >
                        <Height fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {fileType === "txt" && (
                    <Tooltip title="Show Page Breaks (plain text files)">
                      <FormControlLabel
                        sx={{ marginRight: iconPadding + 0.3 }}
                        control={
                          <Switch
                            checked={showPageBreaks}
                            onChange={() => {
                              setShowPageBreaks(!showPageBreaks);
                            }}
                            name="pagebreaks"
                            size="small"
                          />
                        }
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="Switch layout">
                    <FormControlLabel
                      sx={{ marginRight: iconPadding + 0.3 }}
                      control={
                        <Switch
                          checked={alternateLayout}
                          onChange={() => {
                            setAlternateLayout(!alternateLayout);
                          }}
                          name="alternatelayout"
                          size="small"
                        />
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Download files which we can't yet view">
                    <FormControlLabel
                      sx={{ marginRight: iconPadding + 0.3 }}
                      control={
                        <Switch
                          checked={downloadSome}
                          onChange={() => {
                            setDownloadSome(!downloadSome);
                          }}
                          name="downloadsome"
                          size="small"
                        />
                      }
                    />
                  </Tooltip>
                  <Tooltip title={`Compress by ${increment} pixels`}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTopSpace(topSpace + increment);
                      }}
                      // sx={{
                      //   backgroundColor: buttonBackground,
                      //   color: "yellow",
                      // }}
                    >
                      <Compress fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Expand by ${increment} pixels`}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTopSpace(topSpace - increment);
                      }}
                      // sx={{
                      //   backgroundColor: buttonBackground,
                      //   color: "yellow",
                      // }}
                    >
                      <Expand fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {/* </Box> */}
                </Grid>
                <Grid item>
                  <Typography
                    sx={{
                      mt: 1,
                      ml: 2,
                      fontSize: 14,
                    }}
                  >
                    {url}
                  </Typography>
                </Grid>
              </Toolbar>
              {/* </Container> */}
            </AppBar>

            {showLeftPanel && (
              <Grid item xs={alternateLayout ? 2 : 12} sx={{ mt: 0.5 }}>
                <TextField
                  id="fileDirectory"
                  label="Directory"
                  value={fileDirectory}
                  size={"small"}
                  onChange={(e) => setFileDirectory(e.target.value)}
                  sx={{
                    width: alternateLayout
                      ? windowDimension.winWidth / 6
                      : windowDimension.winWidth - 240,
                    mt: 1,
                  }}
                />
                {!waitGetDir && (
                  <Tooltip title="Read directory and show a list of files to select from">
                    <Button
                      onClick={() => {
                        setWaitGetDir(true);
                        getWebDav(fileDirectory);
                      }}
                      size="small"
                      sx={{
                        m: 3,
                        fontSize: 12,
                        backgroundColor: "lightgray",
                        color: "darkgreen",
                      }}
                    >
                      Read
                    </Button>
                  </Tooltip>
                )}
                {!waitGetDir && (
                  <Tooltip title="Read the directory above">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const parent0 = fileDirectory.endsWith("/")
                            ? fileDirectory.slice(0, -1)
                            : fileDirectory,
                          parent1 = parent0.split("/");
                        parent1.pop();
                        const parent = parent1.join("/");
                        // console.log(fileDirectory, parent0, parent1, parent);
                        setFileDirectory(parent);
                        setWaitGetDir(true);
                        getWebDav(parent);
                      }}
                      sx={{ padding: iconPadding }}
                    >
                      <ArrowCircleUp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {!waitSelectFile &&
                  listOfFiles &&
                  fileType === "txt" &&
                  fileViewerType === "log" && (
                    <Tooltip title="Analyze and view log in the Log Viewer">
                      <Button
                        variant="contained"
                        onClick={() => {
                          window.open(
                            logViewerPrefix + selectedFile.value,
                            "_blank"
                          );
                        }}
                        sx={{ ml: 3 }}
                      >
                        View
                      </Button>
                    </Tooltip>
                  )}
                {waitGetDir && <CircularProgress sx={{ ml: 9, mt: 2 }} />}
                <Grid item xs={alternateLayout ? 12 : 5} sx={{ mt: 0.5 }}>
                  {!waitSelectFile && listOfFiles && (
                    <Select
                      placeholder="Choose a file"
                      options={listOfFiles}
                      value={selectedFile}
                      onChange={selectFile}
                      menuIsOpen={alternateLayout ? true : undefined}
                      size={alternateLayout ? 25 : undefined}
                      pageSize={alternateLayout ? 25 : undefined}
                    />
                  )}
                </Grid>
                <Grid item xs={alternateLayout ? 12 : 5} sx={{ mt: 0.5 }}>
                  {!waitSelectFile &&
                    showSheetSelector &&
                    sheetOptions &&
                    alternateLayout &&
                    fileType === "excel" && <Box sx={{ height: 275 }}></Box>}
                  {!waitSelectFile &&
                    showSheetSelector &&
                    sheetOptions &&
                    fileType === "excel" && (
                      <Select
                        placeholder="Choose a sheet"
                        options={sheetOptions}
                        value={selectedSheet}
                        onChange={selectSheet}
                        menuIsOpen={alternateLayout ? true : undefined}
                        size={alternateLayout ? 3 : undefined}
                        pageSize={alternateLayout ? 3 : undefined}
                      />
                    )}
                </Grid>

                {waitSelectFile && <CircularProgress sx={{ ml: 9, mt: 2 }} />}
              </Grid>
            )}
          </>
        }
        <Grid item xs={showLeftPanel ? (alternateLayout ? 10 : 12) : 12}>
          <Box
            ref={fileRef}
            sx={{
              border: 2,
              m: 1,
              fontSize: fontSize,
              maxHeight: windowDimension.winHeight - topSpace,
              minWidth: alternateLayout
                ? windowDimension.winWidth - 350
                : windowDimension.winWidth - 50,
              height: windowDimension.winHeight - topSpace,
              overflow: "auto",
            }}
            onClick={(e) => {
              const value = e.target.innerHTML.slice(1, -1);
              console.log(value);
              if (value.startsWith("/")) {
                // handle absolute paths
                window.open(fileViewerPrefix + value, "_blank");
              }
              if (value.startsWith("../")) {
                // handle relative paths
                const prefix0 = fileDirectory.split("/");
                prefix0.pop();
                const prefix = prefix0.join("/");
                window.open(
                  fileViewerPrefix + prefix + value.substring(2),
                  "_blank"
                );
              }
              if (value.startsWith("./")) {
                window.open(
                  fileViewerPrefix + fileDirectory + value.substring(1),
                  "_blank"
                );
              }
              if (value.startsWith("sdd:///"))
                window.open(fileViewerPrefix + value.substring(6), "_blank");
            }}
          >
            {["excel", "xlsx", "csv"].includes(fileType) && rows && cols ? (
              <DataGridPro
                rows={rows}
                columns={cols}
                density="compact"
                rowHeight={30}
                sx={{
                  fontSize: "0.8em",
                }}
              />
            ) : ["pdf"].includes(fileType) ? (
              <Document file={pdfFile} page={page}>
                <Page
                  pageNumber={1}
                  width={
                    alternateLayout
                      ? windowDimension.winWidth - 150 + imageDelta / 2
                      : windowDimension.winWidth + imageDelta / 2
                  }
                />
                {/* <Page pageNumber={pageNumber} /> */}
              </Document>
            ) : ["image", "png", "svg", "jpg"].includes(fileType) ? (
              <img
                src={imageFile}
                width={
                  fitHeight
                    ? undefined
                    : alternateLayout
                    ? windowDimension.winWidth - 350 + imageDelta
                    : windowDimension.winWidth - 50 + imageDelta
                }
                height={fitHeight ? windowDimension.winHeight - 250 : undefined}
                alt="unable to be displayed"
              />
            ) : fileType === "html" ? (
              <pre
                // className="content"
                style={{
                  whiteSpace: "pre",
                  padding: 10,
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              ></pre>
            ) : (
              <Highlight
                // style={{ maxHeight: windowDimension.winHeight - topSpace }}
                className={fileViewerType}
              >
                {content && content.length > 0
                  ? content
                  : "No text to display."}
              </Highlight>
            )}{" "}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
