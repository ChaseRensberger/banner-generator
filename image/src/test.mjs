import sharp from "sharp";
import TextToSVG from "text-to-svg";
import SVGToJpeg from "convert-svg-to-jpeg";
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new S3Client({ region: "us-east-1" });

async function uploadToS3(bucketName, filename, body) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: body,
  };

  const command = new PutObjectCommand(params);

  try {
    const data = await s3.send(command);
    return data;
  } catch (err) {
    throw err;
  }
}

async function addTextToImage(
  imagePath,
  text,
  outputPath,
  fontPath,
  progressPercentage
) {
  try {
    const textToSVG = TextToSVG.loadSync(fontPath);
    const svgText = textToSVG.getSVG(text, {
      x: 0,
      y: 0,
      fontSize: 48,
      anchor: "top",
      attributes: { fill: "white" },
    });

    const image = sharp(imagePath);

    const progressBarHeight = 80;
    const progressBarWidth = 1050;
    const filledWidth = progressBarWidth * (progressPercentage / 100);
    const rxry = 0; // border radius

    const progressBarEmptySVG = `<rect width="${progressBarWidth}" height="${progressBarHeight}" fill="white" rx="${rxry}" ry="${rxry}"/>`;
    const progressBarFilledSVG = `<rect width="${filledWidth}" height="${progressBarHeight}" fill="#88DF68" rx="${rxry}" ry="${rxry}"/>`;
    const progressBarSVG = `<svg width="${progressBarWidth}" height="${progressBarHeight}">${progressBarEmptySVG}${progressBarFilledSVG}</svg>`;
    const progressBarJpeg = await SVGToJpeg.convert(progressBarSVG);
    const result = await image
      .composite([
        { input: Buffer.from(progressBarJpeg), top: 700, left: 582 },
        {
          input: Buffer.from(svgText),
          top: 800,
          left: 860,
        },
      ])
      .toFile(outputPath);

    console.log("Image saved with text:", outputPath);
    return "File uploaded successfully";
  } catch (error) {
    return error.toString();
  }
}

const imagePath = "banner.jpeg";
const fontPath = "Arial.ttf";


for (let i = 1; i <= 10000; i++) {
  const text = `${i} subscribers to go!`;
  const outputPath = `banner_${i}.jpg`;
  await addTextToImage(imagePath, text, outputPath, fontPath, 40);
  const data = await uploadToS3("lukej-banners", outputPath, fs.createReadStream(outputPath));
  console.log(`File uploaded successfully: ${data.Location}`);
}
