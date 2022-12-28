'use client';
import { useState } from 'react';
import { Inter } from '@next/font/google';
import styles from './page.module.css';

const inter = Inter({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
});

const languageList = [
  { id: 1, name: 'C++', value: 'cpp' },
  { id: 2, name: 'Python', value: 'py' },
];
export default function Home() {
  const [lang, setLang] = useState('py');
  const [code, setCode] = useState('print("hello world");');
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    console.log('handleSubmit', lang, code);
    const response = await fetch(`/api/code-compiler`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lang,
        code,
      }),
    });
    const output = await response.json();
    setOutput(output.output);
  };
  return (
    <main className={styles.main}>
      <div className={inter.className}>
        <h1>Code Compiler</h1>
      </div>
      <div className={inter.className}>
        <div className={styles.field}>
          <label htmlFor="language" className={styles.label}>
            Language
          </label>
          <select
            id="language"
            name="language"
            className={styles.select}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {languageList.map(({ id, value, name }) => (
              <option key={id} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="code" className={styles.label}>
            Code
          </label>
          <div className="mt-1">
            <textarea
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={10}
              cols={50}
              className={styles.code}
              placeholder="add script here"
            ></textarea>
          </div>
        </div>
        <div className={styles.field}>
          <button className={styles.button} onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Output:</label>
          <div className={styles.output}>{output}</div>
        </div>
      </div>
    </main>
  );
}
