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
  Dialog,
  DialogTitle,
  DialogContent,
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
  Info,
  Science,
  Compress,
  Expand,
} from "@mui/icons-material";
// import {DataGrid } from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
// libraries supporting different file types
import Select from "react-select";
import DOMPurify from "dompurify";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import Highlight from "react-highlight";
import JSZip from "jszip";
import { marked } from "marked";
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
import test_zip from "./test/test.zip";
import test_png from "./test/test.png";
import test_jpg from "./test/test.jpg";
import test_job from "./test/test.job";
import test_json from "./test/test.json";
import test_mnf from "./test/test.mnf";
import test_mnf2 from "./test/test-new.mnf";
import test_sas from "./test/test.sas";
import test_csv from "./test/test.csv";
import test_md from "./test/test.md";
import test_nosuffix from "./test/nosuffix";
import { WebR } from "webr";

export default function App() {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="

  );
  let pageNumber = 1;

  // xmlMaxCol = 0;
  const webR = new WebR(),
    experiment = async () => {
      await webR.init();
      let result = await webR.evalR("rnorm(10,5,1)");
      let output = await result.toArray();
      console.log("result of rnorm(10,5,1)", output);
      setContent(output.join("\n"));
    },
    urlPrefix = window.location.protocol + "//" + window.location.host,
    { href } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    server = href.split("//")[1].split("/")[0],
    processTextDelay = 2000,
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
    [openInfo, setOpenInfo] = useState(false),
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
    [zipFile, setZipFile] = useState(null),
    [fitHeight, setFitHeight] = useState(true),
    [page] = useState(1),
    [waitGetDir, setWaitGetDir] = useState(false),
    [waitSelectFile, setWaitSelectFile] = useState(false),
    [, setSelection] = useState(null),
    [selectedFile, setSelectedFile] = useState(null),
    [selectedSheet, setSelectedSheet] = useState(null),
    [sheetOptions, setSheetOptions] = useState(null),
    [showSheetSelector, setShowSheetSelector] = useState(null),
    logViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/logviewer2/index.html?log=`,
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
      "ico",
      "jar",
      "gz",
    ], // list of file types that we can't yet view in the browser properly
    openTheseFileTypesNow = ["html", "htm"], // list of file types that we want to open in a new tab when selected
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
      } else if (downloadSome && openTheseFileTypesNow.includes(fileType)) {
        // download file rather than view it
        console.log("open in new tab file: ", value, fileName);
        openInNewTab(`${value}`);
      } else if (downloadSome && fileType === "log") {
        // download file rather than view it
        console.log("open in new tab file: ", value, fileName);
        window.open(logViewerPrefix + value, "_blank");
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
      // console.log(file)
      setWaitGetDir(true);
      fetch(file).then(function (response) {
        // console.log(response);
        response.text().then(async function (text) {
          // console.log("ft", ft);
          setOriginalContent(text);
          setWaitGetDir(false);
          setContent(text);
          const newText = ["mnf", "lst"].includes(ft)
            ? analyseHtml(text)
            : analyse(text);
          const delay = (ms) => new Promise((res) => setTimeout(res, ms));
          await delay(processTextDelay);
          setContent(newText);
          setFileViewerType(ft);
          setFileType("txt");
        });
      });
    },
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
    processMd = (resp) => {
      console.log("resp", resp);
      setFileType("md");
      return marked.parse(resp);
    },
    getFile = (url) => {
      console.log(url);
      // local mode for test and development
      if (mode === "local") {
        if (url === "test_lst") processText(test_lst, "txt");
        else if (url === "test_txt") processText(test_txt, "txt");
        else if (url === "test_nosuffix") processText(test_nosuffix, "txt");
        else if (url === "test_sas") processText(test_sas, "sas");
        // else if (url === "test_job") processXmlFile(test_job);
        else if (url === "test_job") processText(test_job, "xml");
        // else if (url === "test_mnf") processXmlFile(test_mnf);
        else if (url === "test_mnf") processText(test_mnf, "mnf");
        else if (url === "test_mnf2") processText(test_mnf2, "mnf");
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
        } else if (url === "test_md") {
          fetch(test_md).then(function (response) {
            response.text().then(function (text) {
              setOriginalContent(text);
              const newText = processMd(text);
              setContent(DOMPurify.sanitize(newText));
              setFileType("md");
              setFileViewerType("md");
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
        } else if (url === "test_zip") {
          setZipFile(test_zip);
          setFileType("zip");
          handleZipFile(url);
          fetch("./test/test.zip")
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
              // Use jszip to load the zip file contents
              return JSZip.loadAsync(arrayBuffer);
            })
            .then((zip) => {
              // Get an array of file names in the zip
              const fileNames = Object.keys(zip.files);
              console.log("Contents of the zip file:", fileNames);
              setWaitGetDir(false);
            })
            .catch((error) => {
              console.error(
                "Error fetching or listing contents of the zip:",
                error
              );
              setWaitGetDir(false);
            });
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
        } else if (["zip"].includes(tempFileType)) {
          setZipFile(url);
          setFileType("zip");
          setWaitGetDir(true);
          handleZipFile(url);
        } else if (["mnf", "lst"].includes(tempFileType)) {
          setWaitGetDir(true);
          fetch(url).then(function (response) {
            response.text().then(function (text) {
              setOriginalContent(text);
              const newText = analyseHtml(text);
              setContent(newText);
              setFileType("txt");
              setFileViewerType(tempFileType);
              setWaitGetDir(false);
            });
          });
        } else if (["md"].includes(tempFileType)) {
          fetch(url).then(function (response) {
            response.text().then(function (text) {
              setOriginalContent(text);
              const newText = processMd(text);
              setContent(DOMPurify.sanitize(newText));
              setFileType(tempFileType);
              setFileViewerType(tempFileType);
              setWaitGetDir(false);
            });
          });
        } else if (splitDots.length > 0 || thisIsADir === false) {
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
    },
    handleZipFile = (url) => {
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          // Use jszip to load the zip file contents
          return JSZip.loadAsync(arrayBuffer);
        })
        .then((zip) => {
          console.log("zip", zip);
          // Get an array of file names in the zip
          const fileNames = Object.keys(zip.files);
          console.log("Contents of the zip file:", fileNames);
          let content =
            "<table><tr><th>File name</th><th>Directory</th><th>Compressed</th><th>Uncompressed</th><th>Date</th></tr>";
          zip.forEach((relativePath, zipEntry) => {
            console.log("relativePath", relativePath, "zipEntry", zipEntry);
            content += `<tr><td>${zipEntry.name}</td><td>${zipEntry.dir}</td><td>${zipEntry._data.compressedSize}</td><td>${zipEntry._data.uncompressedSize}</td><td>${zipEntry.date}</td></tr>`;
          });
          content += "</table>";
          setContent(content);
          setWaitGetDir(false);
        })
        .catch((error) => {
          console.error(
            "Error fetching or listing contents of the zip:",
            error
          );
          setContent("Error fetching or listing contents of the zip:" + error);
          setWaitGetDir(false);
        });
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
          { id: 13, value: "test_mnf2", label: "Text (mnf new)" },
          { id: 14, value: "test_job", label: "Text (job)" },
          { id: 15, value: "test_doc", label: "Word (docx)" },
          { id: 16, value: "test_nosuffix", label: "Text (no suffix)" },
          { id: 17, value: "test_zip", label: "Zip (zip)" },
          { id: 18, value: "test_md", label: "Markdown (md)" },
          // { id: 19, value: "test_ppt", label: "PowerPoint (ppt)" },
        ]);
      } else await getDir(webDavPrefix + dir, 1, processXml);
      setWaitGetDir(false);
    },
    [listOfFiles, setListOfFiles] = useState(null),
    analyse = (text) => {
      const pageCount = (match, offset, string) => {
          pageNumber++;
          return (
            "\n\n" +
            "=".repeat(64) +
            "]- Page " +
            pageNumber +
            " -[" +
            "=".repeat(64) +
            "\n\n\n"
          );
        },
        pagebreak2 = "\n\n",
        newText = text.replace(/\f/gm, showPageBreaks ? pageCount : pagebreak2);
      return newText;
    },
    analyseHtml = (text) => {
      console.log("analyseHtml");
      const textArray = text.split("\n").map((line) => {
        let app = fileViewerPrefix;
        if (line.includes(".log")) app = logViewerPrefix;
        let version = "";
        if (line.includes("version="))
          version = line.replace(/.*version="([\d|\\.]+)".*/gm, `?version=$1`);
        const line2 = line
          .replace(/</gm, "&lt;")
          .replace(/>/gm, "&gt;")
          .replace(
            /(\/general\/[\w|/|.|-]+)/gm,
            `<a href='${app}$1${version}' target='_blank'>$1</a>`
          )
          .replace(
            /(\/clinical\/[\w|/|.|-]+)/gm,
            `<a href='${app}$1${version}' target='_blank'>$1</a>`
          )
          .replace(
            /(\/Users\/[\w|/|.|-]+)/gm,
            `<a href='${app}$1${version}' target='_blank'>$1</a>`
          );
        return line2;
      });
      console.log(textArray);
      const newText = textArray.join("\n");
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
            label: isDirectory
              ? name
              : name +
                (modified ? " (" : "") +
                (modified ? modified : "") +
                (modified ? ") " : "") +
                (checkedOut && checkedOut !== "No" ? "checked-out " : "") +
                (locked && locked !== "No" ? "locked " : ""),
            // label: name,
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

      console.log("files", files);
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
      console.log("chunk", chunk);
      setOriginalContent(chunk);
      setContent(chunk);
    };

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
    // const init = webR.init();
    // console.log(init);
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
        tempFileType = tempFileName.split("?")[0].split(".").pop(),
        version =
          splitQuestionMarks.length > 2 ? "?" + splitQuestionMarks[2] : null,
        fileWithVersion = version ? file + version : file;
      document.title = tempFileName;
      setURL(fileWithVersion);
      getFile(fileWithVersion);
      setFileName(tempFileName);
      setFileType(tempFileType);
      console.log(
        "tempFileName",
        tempFileName,
        "tempFileType",
        tempFileType,
        "splitQuestionMarks",
        splitQuestionMarks
      );
      setFileViewerType(["job"].includes(tempFileType) ? "xml" : tempFileType);
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
      console.log(
        "file",
        file,
        "\n",
        "fileDirBits",
        fileDirBits,
        "fileDir",
        fileDir,
        "partialFile",
        partialFile,
        "urlPrefix",
        urlPrefix,
        "filePrefix",
        filePrefix,
        "ind",
        ind,
        "tempFileName",
        tempFileName,
        "short",
        short,
        'tempFileName.split(".").length',
        tempFileName.split(".").length
      );

      if (tempFileName.split(".").length === 1) {
        setFileDirectory("/" + short + "/" + tempFileName);
        getWebDav("/" + short + "/" + tempFileName);
      } else {
        if (short.startsWith("/")) {
          setFileDirectory(short);
          // getWebDav(short);
        } else {
          setFileDirectory("/" + short);
          // getWebDav("/" + short);
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
  //   selectedFile
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
                          mr: 1,
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
                    >
                      <Expand fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Run some R code in browser">
                    <IconButton size="small" onClick={experiment}>
                      <Science fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Information about this screen">
                    <IconButton
                      color="info"
                      sx={{ position: "fixed", top: 2, right: 2, zIndex: 100 }}
                      onClick={() => {
                        setOpenInfo(true);
                      }}
                    >
                      <Info />
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
                {!waitGetDir && (
                  <Tooltip title="Copy the directory to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const dir = fileDirectory.endsWith("/")
                            ? fileDirectory.slice(0, -1)
                            : fileDirectory,
                          rx = /(\/general\/.*|\/clinical\/.*|\/Users\/.*)/g,
                          matchDir = rx.exec(dir);
                        navigator.clipboard.writeText(matchDir[0]);
                      }}
                      sx={{ ml: 1, padding: iconPadding }}
                    >
                      <ContentCopy fontSize="small" />
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
                ? windowDimension.winWidth - 400
                : windowDimension.winWidth - 50,
              height: windowDimension.winHeight - topSpace,
              overflow: "auto",
            }}
            onClick={(e) => {
              const value = e.target.innerHTML.slice(1, -1);
              // console.log("e", e, "value", value);
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
            ) : ["md"].includes(fileType) ? (
              <pre
                // className="content"
                style={{
                  whiteSpace: "pre",
                  padding: 10,
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              ></pre>
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
            ) : ["html", "mnf", "lst", "zip"].includes(fileType) ||
              ["mnf", "lst"].includes(fileViewerType) ? (
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
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
        title={"Info about this screen"}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
          <ul>
            <li>Toolbar at the top - hover over icons to see what they do.</li>
            <li>
              Directory - you can enter a directory to read files from, by
              pressing the <b>Read</b> button.
            </li>
            <li>
              Up arrow will navigate up a level in directory, and read the files
              in.
            </li>
            <li>
              You can use the email button to ask questions or make suggestions
              about this. Or to send a link you are currently looking at to
              someone to see.
            </li>
            <li>
              Take a look at this document that explains this screen some more:{" "}
              <a
                href={`https://argenxbvba.sharepoint.com/:w:/r/sites/Biostatistics/_layouts/15/doc.aspx?sourcedoc=%7B8533665c-c5e0-40a4-b5d8-0a72be75b201%7D`}
                target="_blank"
                rel="noreferrer"
              >
                File Viewer User Guide
              </a>
            </li>
          </ul>
          <Tooltip title={"Email technical programmers"}>
            <Button
              sx={{
                color: "blue",
                border: 1,
                borderColor: "blue",
                borderRadius: 1,
                padding: 0.4,
                float: "right",
              }}
              onClick={() => {
                window.open(
                  "mailto:qs_tech_prog@argenx.com?subject=Question&body=This email was sent from: " +
                    encodeURIComponent(href) +
                    "%0D%0A%0D%0AMy question is:",
                  "_blank"
                );
              }}
            >
              Email
            </Button>
          </Tooltip>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
