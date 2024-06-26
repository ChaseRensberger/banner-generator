import sharp from "sharp";
// import TextToSVG from "text-to-svg";
// import SVGToJpeg from "convert-svg-to-jpeg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3 = new S3Client({ region: "us-east-1" });

async function addTextToImage(
  imagePath,
  text,
  outputPath,
  fontPath,
  progressPercentage
) {
  try {
    // const textToSVG = TextToSVG.loadSync(fontPath);
    // const svgText = textToSVG.getSVG(text, {
    //   x: 0,
    //   y: 0,
    //   fontSize: 48,
    //   anchor: "top",
    //   attributes: { fill: "white" },
    // });

    const image = sharp(imagePath);

    // const progressBarHeight = 80;
    // const progressBarWidth = 1050;
    // const filledWidth = progressBarWidth * (progressPercentage / 100);
    // const rxry = 0; // border radius

    // const progressBarEmptySVG = `<rect width="${progressBarWidth}" height="${progressBarHeight}" fill="white" rx="${rxry}" ry="${rxry}"/>`;
    // const progressBarFilledSVG = `<rect width="${filledWidth}" height="${progressBarHeight}" fill="#88DF68" rx="${rxry}" ry="${rxry}"/>`;
    // const progressBarSVG = `<svg width="${progressBarWidth}" height="${progressBarHeight}">${progressBarEmptySVG}${progressBarFilledSVG}</svg>`;
    // const progressBarJpeg = await SVGToJpeg.convert(progressBarSVG);
    const result = await image
      // .composite([
      //   { input: Buffer.from(progressBarJpeg), top: 700, left: 582 },
      //   {
      //     input: Buffer.from(svgText),
      //     top: 800,
      //     left: 860,
      //   },
      // ])
      .toFile(outputPath);

    console.log("Image saved with text:", outputPath);
    // Read the output file into a buffer
    const fileStream = fs.createReadStream(outputPath);

    // Upload the buffer to S3
    const params = {
      Bucket: "lukej-banners",
      Key: `thumbnail`,
      Body: fileStream,
    };

    try {
      const data = await s3.send(new PutObjectCommand(params));
      // data.Location is the URL of the uploaded file
      return "File uploaded successfully";
    } catch (error) {
      return error.toString();
    }
  } catch (error) {
    return error.toString();
  }
}

export const handler = async (event) => {
  const imagePath = "banner.jpeg";
  const outputPath = "/tmp/output-image.jpg";
  const fontPath = "Arial.ttf";
  const text = "5,341 subscribers to go!";

  const output_msg = await addTextToImage(imagePath, text, outputPath, fontPath, 40);

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: output_msg }),
  };
  return response;
};
