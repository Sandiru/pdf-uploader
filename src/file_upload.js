import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [extractedFiles, setExtractedFiles] = useState([
    { text_dir: "", text: "", image_dir: "", image_filenames: [] },
  ]);
  const [isShow, setIsShow] = useState(true);
  const [isShows, setIsShows] = useState(false);
  const [fileContent, setFileContent] = useState("");

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).slice(0, 10);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    setUploading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedFiles(res.data);
      setIsShow(false);
    } catch (error) {
      alert(error);
      alert("Upload failed: " + error.response?.data?.error || error.message);
    }
    setUploading(false);
  };

  const handleOutput = () => {};

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Upload PDFs</h2>
      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {/*<div>
        <button onClick={handleOutput} disabled={isShow} isShows={true}>
          {"Show"}
        </button>
      </div>*/}

      <div>
        <h3>Response</h3>
        <h4>Text</h4>
        <div>
          {extractedFiles.map((file, index) => (
            <div key={index}>
              <h3>Text File:</h3>
              <pre>{file.text}</pre>
              <h4>Images:</h4>
              {file.image_filenames.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={`http://localhost:5000/images/${img.split('/').pop()}`}
                    alt={idx}
                    style={{ width: "200px" ,height:"200px"}}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
