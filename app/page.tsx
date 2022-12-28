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

const defaultCppProgram = `#include <stdio.h>
#include <iostream>

int main() {
printf("Hello world! from C++");
return 0;
}`;

const defaultPyProgram = 'print("Hello world! from python");';
export default function Home() {
  const [lang, setLang] = useState('py');
  const [code, setCode] = useState(defaultPyProgram);
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
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
    try {
      const data = await response.json();
      const { error_message, output } = data;
      if (error_message) {
        const errorList = error_message.split(',');
        setOutput(errorList[errorList.length - 1]);
      } else {
        setOutput(output);
      }
    } catch (err) {
      setOutput(JSON.stringify(err));
    }
  };
  return (
    <main className={styles.main}>
      <div className={inter.className}>
        <h1>Online Code Compiler</h1>
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
            onChange={(e) => {
              setLang(e.target.value);
              if (e.target.value === 'cpp') {
                setCode(defaultCppProgram);
              } else if (e.target.value === 'py') {
                setCode(defaultPyProgram);
              } else {
                setCode('');
              }
            }}
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
          <div>
            <textarea
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={10}
              cols={100}
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
          <div>
            <textarea
              className={styles.output}
              value={output}
              rows={10}
              cols={10}
              disabled
            ></textarea>
          </div>
        </div>
      </div>
    </main>
  );
}
