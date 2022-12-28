import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

type Data = {
  output: string;
};

type ErrorBlock = {
  error_message: string;
};

const generateFile = async (format: string, content: string) => {
  const jobId = randomUUID();
  const fileName = `${jobId}.${format}`;
  const dirCodes = path.join(__dirname, 'codes');
  const filePath = path.join(dirCodes, fileName);
  if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  return filePath;
};

const executeFilePy = (fileName: string) => {
  return new Promise((resolve, reject) => {
    exec(`python3 ${fileName}`, (error, stdout, stderr) => {
      error && reject({ error, stderr });
      stderr && reject(stderr);
      resolve(stdout);
    });
  });
};
const post = async (
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorBlock | any>
) => {
  try {
    const { lang, code } = req.body;
    if (!code) {
      res.status(400).json({ error_message: 'empty code' });
    }
    if (lang === 'py') {
      const filepath = await generateFile(lang, code);
      const output = await executeFilePy(filepath);
      res.status(200).json({ output: output });
    } else {
      res.status(501).json({ error_message: 'unknown language' });
    }
  } catch (err) {
    return res.status(500).json({ err });
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorBlock>
) {
  if (req.method === 'POST') {
    post(req, res);
  }
}
