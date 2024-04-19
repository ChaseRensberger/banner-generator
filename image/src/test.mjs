import fs from "fs";
import { createCanvas, loadImage } from 'canvas';

async function addTextToImage(
  imagePath,
  text,
  outputPath,
  progressPercentage
) {
  try {

    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0, image.width, image.height);

    context.font = '48px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 0);

    const progressBarHeight = 80;
    const progressBarWidth = 1050;
    const filledWidth = progressBarWidth * (progressPercentage / 100);

    context.fillStyle = 'white';
    context.fillRect(0, 700, progressBarWidth, progressBarHeight);

    context.fillStyle = '#88DF68';
    context.fillRect(0, 700, filledWidth, progressBarHeight);

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);

    console.log("Image saved with text:", outputPath);

    console.log("Image saved with text:", outputPath);
    // Read the output file into a buffer

    return "File uploaded successfully";
  } catch (error) {
    console.log(error)
  }
}

export const handler = async (event) => {
  const imagePath = "banner.jpeg";
  const outputPath = "output-image.jpg";
  const fontPath = "Arial.ttf";
  const text = "5,341 subscribers to go!";

  const output_msg = await addTextToImage(
    imagePath,
    text,
    outputPath,
    fontPath,
    40
  );

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: output_msg }),
  };
  return response;
};

handler(null)
