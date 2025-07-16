
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generatePDF = async (tasks) => {
  // Define the table headers
  const headers = [
    { label: 'Title', width: 100 },
    { label: 'Assigned To', width: 100 },
    { label: 'Facility', width: 150 },
    { label: 'Machine', width: 130 },
    { label: 'Status', width: 100 },
    { label: 'Task Period', width: 150 },
    { label: 'Tools', width: 130 },
    { label: 'Materials', width: 150 },
  ];
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1000, 800]); // Wider page

  // Set up fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Define starting positions for the table
  const startX = 50; // Left margin
  const startY = 750; // Top margin
  const rowHeight = 20; // Height of each row
  const lineHeight = 15; // Height of text within a row

  // Add a title to the PDF
  const title = 'Task Report';
  const titleWidth = boldFont.widthOfTextAtSize(title, 18);
  page.drawText(title, {
    x: startX + (page.getWidth() - startX * 2 - titleWidth) / 2, // Center the title
    y: startY + 30, // Position above the table
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Add the date of PDF generation
  const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 12);
  page.drawText(dateText, {
    x: startX + (page.getWidth() - startX * 2 - dateWidth) / 2, // Center the date
    y: startY + 10, // Position below the title
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  
  // Draw table headers
  headers.forEach((header, colIndex) => {
    const x = startX + headers.slice(0, colIndex).reduce((acc, h) => acc + h.width, 0);
    page.drawText(header.label, {
      x,
      y: startY - 30, // Position below the line row
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  });

  // Draw horizontal line below headers
  page.drawLine({
    start: { x: startX, y: startY - 35 },
    end: { x: startX + headers.reduce((acc, h) => acc + h.width, 0), y: startY - 35 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Draw table rows
  tasks.forEach((task, rowIndex) => {
    const rowY = startY - 50 - (rowIndex + 1) * rowHeight; // Adjusted Y position for rows

    // Draw row data
    headers.forEach((header, colIndex) => {
      const x = startX + headers.slice(0, colIndex).reduce((acc, h) => acc + h.width, 0);
      let text = 'N/A';

      switch (header.label) {
        case 'Title':
          text = task.title || 'N/A';
          break;
        case 'Assigned To':
          text = Array.isArray(task.assigned_to)
            ? task.assigned_to.map((user) => `${user.first_name} ${user.last_name}`).join(', ') || 'N/A'
            : 'N/A';
          break;
        case 'Facility':
          text = task.facility?.facility_name || 'N/A';
          break;
        case 'Machine':
          text = task.machine?.machine_name || 'N/A';
          break;
        case 'Status':
          text = task.status || 'N/A';
          break;
        case 'Task Period':
          text = task.task_period || 'N/A';
          break;
        case 'Tools':
          text = Array.isArray(task.tools)
            ? task.tools.map((tool) => tool.tool_name || 'Unknown').join(', ')
            : 'N/A';
          break;
        case 'Materials':
          text = Array.isArray(task.materials)
            ? task.materials.map((material) => material.material_name || 'Unknown').join(', ')
            : 'N/A';
          break;
        default:
          text='N/A';
      }

      // Split text into lines that fit within the column width
      const lines = [];
      let currentLine = '';
      text.split(' ').forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, 10);
        if (testWidth <= header.width - 10) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });
      lines.push(currentLine);

      // Draw each line
      lines.forEach((line, lineIndex) => {
        page.drawText(line, {
          x,
          y: rowY - lineIndex * lineHeight, // Move down for each line
          size: 10,
          font,
          color: rgb(0, 0, 0),
          maxWidth: header.width - 10,
        });
      });
    });

    // Draw horizontal line below each row
    page.drawLine({
      start: { x: startX, y: rowY - 5 },
      end: { x: startX + headers.reduce((acc, h) => acc + h.width, 0), y: rowY - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  });

  // Draw vertical lines for the table
  let currentX = startX;
  headers.forEach((header) => {
    page.drawLine({
      start: { x: currentX, y: startY - 30 },
      end: { x: currentX, y: startY - 50 - (tasks.length + 1) * rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    currentX += header.width;
  });

  // Draw the final vertical line
  page.drawLine({
    start: { x: currentX, y: startY - 30 },
    end: { x: currentX, y: startY - 50 - (tasks.length + 1) * rowHeight },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
};

  export const generateExcel = (tasks) => {
  const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
    Title: task.title || 'N/A',
    AssignedTo: Array.isArray(task.assigned_to) ? task.assigned_to.map(user => `${user.first_name} ${user.last_name}`).join(', ') : 'N/A',
    Facility: task.facility?.facility_name || 'N/A',
    Machine: task.machine?.machine_name || 'N/A',
    Status: task.status || 'N/A',
    TaskPeriod: task.task_period || 'N/A',
    Tools: Array.isArray(task.tools) ? task.tools.map(tool => tool.tool_name || 'Unknown').join(', ') : 'N/A',
    Materials: Array.isArray(task.materials) ? task.materials.map(material => material.material_name || 'Unknown').join(', ') : 'N/A'
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  XLSX.writeFile(workbook, 'Task_Report.xlsx');
};
