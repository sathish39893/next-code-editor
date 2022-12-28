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

const executeCppFile = (filePath: string) => {
  const jobId = path.basename(filePath).split('.')[0];
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outputFile} && cd ${outputDir} && ./${jobId}.out -v`,
      (error, stdout, stderr) => {
        error && reject({ error, error_message: stderr });
        stderr && reject({ error_message: stderr });
        resolve(stdout);
      }
    );
  });
};

const executePyFile = (filePath: string) => {
  return new Promise((resolve, reject) => {
    exec(`python3 ${filePath}`, (error, stdout, stderr) => {
      error && reject({ error, error_message: stderr });
      stderr && reject({ error_message: stderr });
      resolve(stdout);
    });
  });
};

const executeCodeFile = async (lang: string, filePath: string) => {
  if (lang === 'cpp') {
    return await executeCppFile(filePath);
  } else if (lang === 'py') {
    return await executePyFile(filePath);
  }
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
    if (lang === 'py' || lang === 'cpp') {
      const filepath = await generateFile(lang, code);
      const output = await executeCodeFile(lang, filepath);
      res.status(200).json({ output: output });
    } else {
      res.status(501).json({ error_message: 'Unknown language' });
    }
  } catch (err) {
    res.status(500).json(err);
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
