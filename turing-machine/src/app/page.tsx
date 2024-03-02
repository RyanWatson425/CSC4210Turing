'use client'
import { useState, useEffect } from 'react';
import { defaultData } from './data/defaultMachine';

export default function Home() {
  //Q
  const [states, setStates] = useState<Set<string>>(new Set());
  //Σ
  const [sigma, setSigma] = useState<Set<string>>(new Set());
  //Γ
  const [gamma, setGamma] = useState<Set<string>>(new Set());
  //δ: [Q, Γ]: [Q, Γ, 'L' | 'R'] 
  const [delta, setDelta] = useState<Map<string, Array<string>>>(new Map());
  //q0
  const [q0, setQ0] = useState<string>("");
  //qa
  const [qa, setQA] = useState<string>("");
  //qr
  const [qr, setQR] = useState<string>("");
  const [userInput, setUserInput] = useState<String>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [configurations, setConfigurations] = useState<Array<string>>([]);
  const [statusMessage, setStatus] = useState<"accepted" | "rejected" | "processing..." | "not started">("not started");

  const createDefaultMachine = () => {
    setStatus("not started");
    setStates(new Set(defaultData.Q));
    setSigma(new Set(defaultData.sigma));
    setGamma(new Set(defaultData.gamma));
    setQ0(defaultData.q0);
    setQA(defaultData.qa);
    setQR(defaultData.qr);
    const defaultDelta = new Map();
    defaultData.delta.forEach((rule) => defaultDelta.set(JSON.stringify(rule[0]), rule[1]));
    console.log(defaultDelta.keys());
    setDelta(defaultDelta);
  }

  const resetMachine = () => {
    setStatus("not started");
    setStates(new Set());
    setSigma(new Set());
    setGamma(new Set());
    setDelta(new Map());
    setQ0("");
    setQA("");
    setQR("");
  }

  const executeMachine = () => {
    setStatus("processing...");
    let currentConfigurations = [];
    let tape = userInput;
    let currentState: string = q0;
    let currentIdx: number = 0;
    currentConfigurations.push(tape.slice(0, currentIdx) + currentState + tape.slice(currentIdx));
    while(currentState !== qa && currentState !== qr && !errorMessage) {
      const currentSymbol: string = tape.slice(currentIdx, currentIdx + 1);
      if (delta.has(JSON.stringify([currentState, currentSymbol]))) {
        const ruleApplied = delta.get(JSON.stringify([currentState, currentSymbol])) as string[];
        currentState = ruleApplied[0];
        if (currentIdx >= tape.length) {
          tape += ruleApplied[1];
        } else {
          tape = tape.slice(0, currentIdx) + ruleApplied[1] + tape.slice(currentIdx + 1);
        }
        if (ruleApplied[2] === 'L') {
          if (currentIdx === 0) {
            tape = "_" + tape;
          } else {
            currentIdx--;
          }
        } else if (ruleApplied[2] === 'R') {
          if (currentIdx === tape.length - 1) {
            tape = tape + "_";
          }
          currentIdx++;
        } else {
          setErrorMessage("Invalid Rule: " + "[" + currentState + "," + currentSymbol + "] -> " + "[" + ruleApplied[0] + ", " + ruleApplied[1] + ", " + ruleApplied[2] + "]");
          setStatus("rejected");
          return;
        }
      } else {
        console.log("delta does not have [" + currentState + "," + currentSymbol + "]");
        // console.log(delta.get[currentState, currentSymbol] !== undefined ? delta.get[currentState, currentSymbol] : "nothing");
        currentState = qr;
      }
      currentConfigurations.push(tape.slice(0, currentIdx) + currentState + tape.slice(currentIdx));
    }


    setConfigurations(currentConfigurations);

    if (currentState === qa) {
      setStatus("accepted");
    } else if (currentState === qr) {
      setStatus("rejected");
    } else {
      setErrorMessage("Error Occured - Machine did not end on accept state or reject state");
      setStatus("rejected");
    }
  }



  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <div>
        Create a Turing Machine and watch it run!
      </div>
      <div>
        <label>
          Specify Input:
          <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' type='text' onChange={input => setUserInput(input.target.value)}/>
        </label>
      </div>
      <div className='m-2'>
        <button className='border-2 hover:bg-gray-100 m-2 rounded-md p-1' onClick={executeMachine}>Run Default Turing Machine</button>
        <button className='border-2 hover:bg-gray-100 m-2 rounded-md p-1' onClick={createDefaultMachine}>Create Example Turing Machine</button>
        <button className='border-2 hover:bg-gray-100 m-2 rounded-md p-1' onClick={resetMachine}>Delete Turing Machine</button>
      </div>
      <div>
        {userInput}
      </div>
      <div className='font-bold text-lg text-red-700'>
        {errorMessage}
      </div>
      <div>
        {configurations.length > 0 ? (<ol>configuration:<hr/>{configurations.map((config, idx) => <li key={idx}>{idx + 1 + ".   " + config}</li>)}</ol>) : <></>}
      </div>
      <div className='font-bold'>
        {statusMessage !== "not started" ? statusMessage : <></>}
      </div>
      <div className='flex flex-col justify-start'>
        <div className='flex flex-row'>Q:{Array.from(states).map((state) => <div> {state}</div>)}</div>
        <div className='flex flex-row'>Σ:{Array.from(sigma).map((symbol) => <div> {symbol}</div>)}</div>
        <div className='flex flex-row'>Γ:{Array.from(gamma).map((symbol) => <div> {symbol}</div>)}</div>
        <div className='flex flex-row'>q0:<div> {q0}</div></div>
        <div className='flex flex-row'>qa:<div> {qa}</div></div>
        <div className='flex flex-row'>qr:<div> {qr}</div></div>
        <div className='flex flex-col'>δ: {Array.from(delta).map((rule) => <div> {rule[0]} {'->'} {rule[1][0]}, {rule[1][1]}, {rule[1][2]}</div>)}</div>
      </div>
    </main>
  );
}