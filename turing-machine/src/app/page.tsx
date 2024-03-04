'use client'
import React, { useState, useRef, ReactElement } from 'react';
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
  const statesInputRef = useRef<HTMLInputElement>(null);
  const delta1InputRef = useRef<HTMLInputElement>(null);
  const delta2InputRef = useRef<HTMLInputElement>(null);
  const delta3InputRef = useRef<HTMLInputElement>(null);
  const delta4InputRef = useRef<HTMLInputElement>(null);
  const delta5InputRef = useRef<HTMLInputElement>(null);
  const sigmaInputRef = useRef<HTMLInputElement>(null);
  const gammaInputRef = useRef<HTMLInputElement>(null);
  const q0InputRef = useRef<HTMLInputElement>(null);
  const qaInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [displayedStates, setDisplayedStates] = useState<Array<ReactElement>>([]);
  const [displayedSigma, setDisplayedSigma] = useState<Array<ReactElement>>([]);
  const [displayedDelta, setDisplayedDelta] = useState<Array<ReactElement>>([]);
  const [displayedGamma, setDisplayedGamma] = useState<Array<ReactElement>>([]);

  const createDefaultMachine = () => {
    setStatus("not started");
    setStates(new Set(defaultData.Q));
    setDisplayedStates(defaultData.Q.map((state, idx) => idx != 0 ? <div>, {state}</div> : <div className='ml-1'>{state}</div>));
    setSigma(new Set(defaultData.sigma));
    setDisplayedSigma(defaultData.sigma.map((member, idx) => idx != 0 ? <div>, {member}</div> : <div className='ml-1'>{member}</div>));
    setGamma(new Set(defaultData.gamma));
    setDisplayedGamma(defaultData.gamma.map((member, idx) => idx != 0 ? <div>, {member}</div> : <div className='ml-1'>{member}</div>));
    setQ0(defaultData.q0);
    setQA(defaultData.qa);
    setQR(defaultData.qr);
    const defaultDelta = new Map();
    defaultData.delta.forEach((rule) => defaultDelta.set(JSON.stringify(rule[0]), rule[1]));
    setDelta(defaultDelta);
  }

  const resetMachine = () => {
    setStatus("not started");
    setStates(new Set());
    setDisplayedStates([]);
    setSigma(new Set());
    setDisplayedSigma([]);
    setGamma(new Set());
    setDisplayedGamma([]);
    setDelta(new Map());
    setDisplayedDelta([]);
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

  const handleAddState = () => {
    const currInput = statesInputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setStates((prevStates) => new Set([...Array.from(prevStates), newVal]));
      setDisplayedStates(Array.from(new Set([...Array.from(states), newVal])).map((state, idx) => idx != 0 ? <div key={idx}>, {state}</div> : <div className='ml-1' key={-idx}>{state}</div>));
      currInput.value = '';
    }
  }

  const handleAddSigma = () => {
    const currInput = sigmaInputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setSigma((prevSigma) => new Set([...Array.from(prevSigma), newVal]));
      setDisplayedSigma(Array.from(new Set([...Array.from(sigma), newVal])).map((member, idx) => idx != 0 ? <div key={idx}>, {member}</div> : <div className='ml-1' key={-idx}>{member}</div>));
      currInput.value = '';
    }
  }

  const handleAddGamma = () => {
    const currInput = gammaInputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setGamma((prevGamma) => new Set([...Array.from(prevGamma), newVal]));
      setDisplayedGamma(Array.from(new Set([...Array.from(gamma), newVal])).map((member, idx) => idx != 0 ? <div key={idx}>, {member}</div> : <div className='ml-1' key={-idx}>{member}</div>));
      currInput.value = '';
    }
  }

  const handleAddDelta = () => {
    const currInput1 = delta1InputRef.current;
    const currInput2 = delta2InputRef.current;
    const currInput3 = delta3InputRef.current;
    const currInput4 = delta4InputRef.current;
    const currInput5 = delta5InputRef.current;
    if (currInput1 && currInput1.value.length > 0 &&
      currInput2 && currInput2.value.length > 0 &&
      currInput3 && currInput3.value.length > 0 &&
      currInput4 && currInput4.value.length > 0 &&
      currInput5 && currInput5.value.length > 0) {
      const newVal1 = currInput1.value;
      const newVal2 = currInput2.value;
      const newVal3 = currInput3.value;
      const newVal4 = currInput4.value;
      const newVal5 = currInput5.value;
      setDelta((prevDelta) => new Map([...Array.from(prevDelta), [JSON.stringify([newVal1, newVal2]), [newVal3, newVal4, newVal5]]]));
      setDisplayedDelta(Array.from(new Map([...Array.from(delta), [JSON.stringify([newVal1, newVal2]), [newVal3, newVal4, newVal5]]])).map((rule, idx) => {
        const rule1 = JSON.parse(rule[0]);
        return <div key={idx}> {rule1[0]}, {rule1[1]} {'->'} {rule[1][0]}, {rule[1][1]}, {rule[1][2]}</div>
      }));
      currInput1.value = '';
      currInput2.value = '';
      currInput3.value = '';
      currInput4.value = '';
      currInput5.value = '';
    }
  }

  const handleAddQ0 = () => {
    const currInput = q0InputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setQ0(newVal);
      currInput.value = '';
    }
  }

  const handleAddQA = () => {
    const currInput = qaInputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setQA(newVal);
      currInput.value = '';
    }
  }

  const handleAddQR = () => {
    const currInput = qrInputRef.current;
    if (currInput && currInput.value.length > 0) {
      const newVal = currInput.value;
      setQR(newVal);
      currInput.value = '';
    }
  }




  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <div className='flex flex-row justify-around m-3'>
        <button className='border-2 hover:bg-gray-100 m-2 rounded-md px-1 h-10 font-semibold text-rose-700 text-xl' onClick={resetMachine}>Reset</button>
        <div className='flex flex-col text-center'>
          <div className='font-bold text-5xl p-2'>
            Turing Machine Generator
          </div>
          <div className='p-2'>
            Define a Turing Machine and watch it run!
          </div>
        </div>
        <div>
          <button className='border-2 hover:bg-gray-100 m-2 rounded-md px-1 h-10 font-semibold text-gray-500 text-xl' onClick={createDefaultMachine}>Default</button>
          {states && sigma && gamma && delta && q0 && qa && qr ? <button className='border-2 hover:bg-gray-100 m-2 rounded-md p-1 font-semibold text-green-600 text-xl' onClick={executeMachine}>Run</button> : <></>}
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='flex flex-col ml-2 w-1/4'>
          <div>
            Enter fields one at a time
          </div>
          <div className='flex flex-col'>
            <label>
            Q:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={statesInputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddState}>+</button>
            </label>
            <label>
            Σ:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={sigmaInputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddSigma}>+</button>
            </label>
            <label>
            Γ:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={gammaInputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddGamma}>+</button>
            </label>
            <label>
            δ:{' ['}
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 m-1' ref={delta1InputRef} type='text'/>
            {', '}
            <div className='ml-6'>
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 m-1' ref={delta2InputRef} type='text'/>
            {'] -> ['}
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 m-1' ref={delta3InputRef} type='text'/>
            {','}
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 m-1' ref={delta4InputRef} type='text'/>
            {', '}
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 m-1' ref={delta5InputRef} type='text'/>
            {']'}
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddDelta}>+</button>
            </div>
            </label>
            <label>
            q0:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={q0InputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddQ0}>+</button>
            </label>
            <label>
            qa:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={qaInputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddQA}>+</button>
            </label>
            <label>
            qr:
            <input className='border-b-2 border-gray-700 hover:bg-gray-100 mx-1' ref={qrInputRef} type='text'/>
            <button className='border-2 hover:bg-gray-100 m-2 rounded-full text-green-600 aspect-square h-9' onClick={handleAddQR}>+</button>
            </label>
            <div className='flex flex-row my-2'>Q:{displayedStates}</div>
            <div className='flex flex-row my-2'>Σ:{displayedSigma}</div>
            <div className='flex flex-row my-2'>Γ:{displayedGamma}</div>
            <div className='flex flex-row my-2'>q0:<div className='ml-1'> {q0}</div></div>
            <div className='flex flex-row my-2'>qa:<div className='ml-1'> {qa}</div></div>
            <div className='flex flex-row my-2'>qr:<div className='ml-1'> {qr}</div></div>
            <div className='flex flex-col my-2'>δ:{displayedDelta}</div>
          </div>
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
      </div>
    </div>
  );
}