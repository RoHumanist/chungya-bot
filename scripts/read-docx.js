const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use Node.js built-in to unzip and parse docx
const AdmZip = require('adm-zip');

const filePath = process.argv[2] || path.join(
  'C:\\Users\\skyat\\Downloads',
  '기술문서_청약홈 분양정보 조회 서비스_260129.docx'
);

try {
  const zip = new AdmZip(filePath);
  const xmlContent = zip.readAsText('word/document.xml');

  // Simple regex to extract text from w:t tags
  const matches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];

  let currentParagraph = '';
  const lines = [];

  // Split by paragraph markers
  const parts = xmlContent.split(/<\/w:p>/);
  for (const part of parts) {
    const textMatches = part.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const line = textMatches
      .map(m => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
      .join('');
    if (line.trim()) {
      lines.push(line.trim());
    }
  }

  console.log(lines.join('\n'));
} catch (e) {
  console.error('Error:', e.message);
}
