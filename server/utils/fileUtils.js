function saveImage(imageData, fileName) {
  if (typeof imageData !== "string") {
    throw new TypeError("imageData should be a string");
  }

  if (!imageData.startsWith("data:image/jpeg;base64,")) {
    // อัปเดตให้ตรงกับประเภทไฟล์ที่คุณใช้
    throw new Error("Invalid image format");
  }

  imageData = imageData.replace(/^data:image\/jpeg;base64,/, ""); // อัปเดตให้ตรงกับประเภทไฟล์ที่คุณใช้

  const uploadDir = path.join(__dirname, "..", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, imageData, "base64");
}
