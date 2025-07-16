import {  rgb } from 'pdf-lib';

export const linePlugin = {
  pdf: (arg) => {
    const {  page, schema } = arg;
    if (!schema) {
      console.error('Schema is undefined in linePlugin.');
      return;
    }
    const { position, width, height, lineWidth = 1, lineColor = '#000000' } = schema;
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        : null;
    };
    const color = hexToRgb(lineColor);
    page.drawLine({
      start: { x: position.x, y: position.y + height },
      end: { x: position.x + width, y: position.y + height },
      thickness: lineWidth,
      color: color ? rgb(color.r, color.g, color.b) : rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: position.x + width, y: position.y },
      end: { x: position.x + width, y: position.y + height },
      thickness: lineWidth,
      color: color ? rgb(color.r, color.g, color.b) : rgb(0, 0, 0),
    });
  },
  defaultSchema: {
    type: 'line',
    position: { x: 0, y: 0 },
    width: 100,
    height: 10,
    lineWidth: 1,
    lineColor: '#000000',
  },
};
