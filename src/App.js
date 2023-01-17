import React, { useState, useEffect, createRef } from "react";
import Select from "react-select";
import { Grid, Box, Tooltip, IconButton, Typography } from "@mui/material";
import Highlight from "react-highlight";
import "highlight.js/styles/googlecode.css";
import "./App.css";
import {
  Add,
  Remove,
  ContentCopy,
  Download,
  FolderOpen,
  RestartAlt,
  // West,
  // East,
} from "@mui/icons-material";
import test1 from "./test/test.lst";

export default function App() {
  const { href } = window.location,
    fileRef = createRef(),
    [windowDimension, detectHW] = useState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    }),
    detectSize = () => {
      detectHW({
        winWidth: window.innerWidth,
        winHeight: window.innerHeight,
      });
    },
    [fontSize, setFontSize] = useState(12),
    topSpace = 120,
    [content, setContent] = useState(null),
    [options] = useState(null),
    [selectedOption, setSelectedOption] = useState(""),
    [url, setURL] = useState(null),
    [fileName, setFileName] = useState(null),
    [fileType, setFileType] = useState(null),
    selectFile = (index) => {
      const { value } = index;
      setSelectedOption(options[value]);
      //TODO: get the content from selected file
      setContent();
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
    getFile = (url) => {
      fetch(url).then(function (response) {
        response.text().then(function (text) {
          // const newText = analyse(text);
          setContent(text);
        });
      });
    };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => {
      window.removeEventListener("resize", detectSize);
    };
  }, [windowDimension]);

  useEffect(() => {
    const splitQuestionMarks = href.startsWith("localhost")
      ? "http://localhost:3000/:f:/r/sites/Biostatistics/Programming%20documentation/codesamples?file=https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///clinical/argx-113/mg/argx-113-1704/biostat/staging/gba/output/txt/t_3.1.1.5_t_ae.txt".split(
          "?"
        )
      : href.split("?");
    if (splitQuestionMarks.length > 1) {
      const splitEquals = splitQuestionMarks[1].split("="),
        file = splitEquals[1],
        tempFileName = file.split("/").pop(),
        tempFileType = tempFileName.split(".")[1];
      document.title = tempFileName;
      console.log(
        "tempFileName",
        tempFileName,
        "tempFileType",
        tempFileType,
        "file",
        file
      );
      setURL(file);
      getFile(file);
      setFileName(tempFileName);
      setFileType(tempFileType);
    } else {
      fetch(test1)
        .then((r) => r.text())
        .then((r) => {
          setContent(r);
        });
    }
  }, [href]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {options && (
            <Select
              value={selectedOption}
              onChange={selectFile}
              options={options}
            />
          )}
        </Grid>
        {content && (
          <>
            <Grid item xs={4}>
              <Box
                // disableGutters={true}
                variant={"dense"}
                sx={{
                  bgcolor: "background.paper",
                  color: "text.secondary",
                }}
              >
                <Tooltip title="Smaller">
                  <IconButton
                    onClick={() => {
                      setFontSize(fontSize - 1);
                    }}
                  >
                    <Remove />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset to 12">
                  <IconButton
                    onClick={() => {
                      setFontSize(12);
                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Larger">
                  <IconButton
                    onClick={() => {
                      setFontSize(fontSize + 1);
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download File">
                  <IconButton
                    onClick={() => {
                      downloadFile(url, fileName);
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Open in new tab">
                  <IconButton
                    onClick={() => {
                      openInNewTab(`${url}`);
                    }}
                  >
                    <FolderOpen />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy content">
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(content);
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title="Scroll left">
                  <IconButton
                    onClick={() => {
                      fileRef.current.scrollLeft += 500;
                      // fileRef.current.scrollTo(0, 500);
                    }}
                  >
                    <West />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Scroll right">
                  <IconButton
                    onClick={() => {
                      console.log(fileRef);
                      console.log(window);
                      // fileRef.current.scroll({
                      //   top: -20,
                      //   left: -20,
                      //   behavior: "smooth",
                      // });
                    }}
                  >
                    <East />
                  </IconButton>
                </Tooltip> */}
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Typography
                sx={{
                  fontSize: fontSize,
                }}
              >
                {url}
              </Typography>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Box
            ref={fileRef}
            sx={{
              border: 2,
              m: 1,
              fontSize: fontSize,
              maxHeight: windowDimension.winHeight - topSpace,
              minWidth: windowDimension.winWidth - 50,
              overflow: "auto",
            }}
          >
            <Highlight
              // style={{ maxHeight: windowDimension.winHeight - topSpace }}
              className={fileType}
            >
              {content}
            </Highlight>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
