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
      .toBuffer(); // Convert the processed image to a buffer instead of saving it to a file

    return result;
  } catch (error) {
    throw error;
  }
}

const imagePath = "banner.jpeg";
const fontPath = "Arial.ttf";

for (let i = 5118; i <= 7001; i++) {
  const text = `${i} subscribers to go!`;
  const outputFilename = `banner_${i}.jpg`;
  const processedImage = await addTextToImage(imagePath, text, fontPath, ((8900-i)/8900)*100);
  await uploadToS3("lukej-banners", outputFilename, processedImage);
  console.log(`File uploaded successfully: ${i}`);
}
