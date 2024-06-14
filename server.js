const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Cấu hình multer để lưu file với tên gốc và đuôi file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());

app.post("/upload", (req, res) => {
  const inputData = req.body.data;
  let jsonData;

  // Kiểm tra xem inputData có phải là JSON hay không
  try {
    jsonData = JSON.parse(inputData);
  } catch (error) {
    // inputData không phải là JSON
    jsonData = null;
  }

  if (jsonData) {
    // Nếu là JSON, lưu vào data.json
    const filePath = path.join(__dirname, "data.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          return fs.writeFile(filePath, JSON.stringify([jsonData], null, 2), (err) => {
            if (err) {
              return res.status(500).send("Lỗi khi lưu file");
            }
            res.send("Lưu thành công");
          });
        }
        return res.status(500).send("Lỗi khi đọc file");
      }

      let jsonArray = [];
      if (data) {
        jsonArray = JSON.parse(data);
      }

      jsonArray.push(jsonData);

      fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), (err) => {
        if (err) {
          return res.status(500).send("Lỗi khi lưu file");
        }
        res.send("Lưu thành công");
      });
    });
  } else {
    // Nếu là string, lưu vào data_strings.json
    const filePath = path.join(__dirname, "data_strings.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          return fs.writeFile(filePath, JSON.stringify([{ text: inputData }], null, 2), (err) => {
            if (err) {
              return res.status(500).send("Lỗi khi lưu file");
            }
            res.send("Lưu thành công");
          });
        }
        return res.status(500).send("Lỗi khi đọc file");
      }

      let stringArray = [];
      if (data) {
        stringArray = JSON.parse(data);
      }

      stringArray.push({ text: inputData });

      fs.writeFile(filePath, JSON.stringify(stringArray, null, 2), (err) => {
        if (err) {
          return res.status(500).send("Lỗi khi lưu file");
        }
        res.send("Lưu thành công");
      });
    });
  }
});

// Endpoint để xử lý file upload
app.post("/upload-file", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("Không có file nào được tải lên");
  }
  res.send("File đã được tải lên thành công");
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
