import sharp from "sharp";
import TextToSVG from "text-to-svg";
import SVGToJpeg from "convert-svg-to-jpeg";

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
        { input: Buffer.from(progressBarJpeg), top: 750, left: 550 },
        {
          input: Buffer.from(svgText),
          top: 900,
          left: 825,
        },
      ])
      .toFile(outputPath);

    console.log("Image saved with text:", outputPath);
  } catch (error) {
    console.error("Error adding text to image:", error);
  }
}

export const handler = async (event) => {

  console.log(event);

  const imagePath = "banner.jpeg";
  const outputPath = "output-image.jpg";
  const fontPath = "Arial.ttf";
  const text = "5,341 subscribers to go!";

  addTextToImage(imagePath, text, outputPath, fontPath, 40);

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
