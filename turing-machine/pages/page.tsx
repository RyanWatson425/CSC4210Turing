'use client'
import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { defaultData } from '../src/app/data/defaultMachine';
import { Graph } from 'react-d3-graph';

type WindowObject = {
  height: number;
  width: number;
}

type nodeObj = {
  id: string;
}

type linkObj = {
  source: string;
  target: string;
  labelTitle: string;
}

type GraphDataObj = {
  nodes: Array<nodeObj>;
  links: Array<linkObj>;
}

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
  const [displayedTape, setDisplayedTape] = useState<Array<ReactElement>>([]);
  const [isUserInputCollapsed, setIsUserInputCollapsed] = useState<boolean>(true);
  const [windowObject, setWindowObject] = useState<WindowObject>({height: 0, width: 0});
  const [graphData, setGraphData] = useState<GraphDataObj>({nodes: [], links: []});

  const createDefaultMachine = () => {
    setStatus("not started");
    setStates(new Set(defaultData.Q));
    setDisplayedStates(defaultData.Q.map((state, idx) => idx != 0 ? <div key={state}>, {state}</div> : <div key={state} className='ml-1'>{state}</div>));
    setSigma(new Set(defaultData.sigma));
    setDisplayedSigma(defaultData.sigma.map((member, idx) => idx != 0 ? <div key={member}>, {member}</div> : <div key={member} className='ml-1'>{member}</div>));
    setGamma(new Set(defaultData.gamma));
    setDisplayedGamma(defaultData.gamma.map((member, idx) => idx != 0 ? <div key={member}>, {member}</div> : <div key={member} className='ml-1'>{member}</div>));
    setQ0(defaultData.q0);
    setQA(defaultData.qa);
    setQR(defaultData.qr);
    const newDelta = new Map<string, Array<string>>();
    defaultData.delta.forEach((rule) => newDelta.set(JSON.stringify(rule[0]), rule[1]));
    setDelta(newDelta);
    const newDisplayedDelta: Array<ReactElement> = [];
    newDelta.forEach((value, key) => {
      const rule1: Array<string> = JSON.parse(key);
      newDisplayedDelta.push(<div key={key}> {rule1[0]}, {rule1[1]} {'->'} {value[0]}, {value[1]}, {value[2]}</div>);
    });
    setDisplayedDelta(newDisplayedDelta);
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
    setConfigurations([]);
    setUserInput("");
    setDisplayedTape([]);
  }

  const executeMachine = async () => {
    setStatus("processing...");
    let currentConfigurations = [];
    let tape = userInput;
    let currentState: string = q0;
    let currentIdx: number = 0;
    currentConfigurations.push(tape.slice(0, currentIdx) + currentState + tape.slice(currentIdx));
    setConfigurations(currentConfigurations);
    setDisplayedTape(displayTape(tape.toString(), currentIdx));
    await new Promise(resolve => setTimeout(resolve, 500));
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

      //display changes in the tape and configuration
      setConfigurations(currentConfigurations);
      setDisplayedTape(displayTape(tape.toString(), currentIdx));
      await new Promise(resolve => setTimeout(resolve, 500));
    }

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowObject({width: window.innerWidth, height: window.innerHeight});
    }
  }, [])

  useEffect(() => {
    setGraphData({
      nodes: Array.from(states).map((state) => {
        let nodeColor = '#d3d3d3';
        if (state === qa) {
          nodeColor = '#00c04b';
        } else if (state === qr) {
          nodeColor = '#d0312d';
        }

        return {id: state, color: nodeColor};
      }),
      links: Array.from(delta).map((rule) => {
        const sourceName: Array<string> = JSON.parse(rule[0]);

        return {
            source: sourceName[0],
            target: rule[1][0],
            labelTitle: "[" + sourceName[0] + ", " + sourceName[1] + "] -> [" + rule[1][0] + ", " + rule[1][1] + ", " + rule[1][2] + "]", 
          };
      }),
    });
  }, [states, delta, qa, qr]);

  const graphConfig = {
    "automaticRearrangeAfterDropNode": true,
    "collapsible": false,
    "directed": true,
    "height": (windowObject.height / 100) * 70,
    "highlightDegree": 1,
    "highlightOpacity": 1,
    "linkHighlightBehavior": false,
    "nodeHighlightBehavior": false,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    "maxZoom": 8,
    "minZoom": 0.1,
    "focusZoom": 1,
    "panAndZoom": true,
    "width": (windowObject.width / 100) * 60,
    "d3": {
      "alphaTarget": 0.05,
      "gravity": -500,
      "linkLength": 500,
      "linkStrength": 0.1,
      "disableLinkForce": false
    },
    "node": {
      "color": "#d3d3d3",
      "fontColor": "black",
      "fontSize": 20,
      "fontWeight": "normal",
      "highlightColor": "SAME",
      "highlightFontSize": 8,
      "highlightFontWeight": "normal",
      "highlightStrokeColor": "SAME",
      "opacity": 1,
      "renderLabel": true,
      "size": (windowObject.height / 100) * 50,
      "strokeColor": "none",
      "strokeWidth": 1.5,
      "symbolType": "circle"
    },
    "link": {
      "color": "#d3d3d3",
      "fontColor": "black",
      "fontSize": 8,
      "fontWeight": "normal",
      "type": "CURVE_SMOOTH",
      "highlightColor": "SAME",
      "highlightFontSize": 8,
      "highlightFontWeight": "normal",
      "opacity": 1,
      "renderLabel": true,
      "labelProperty": (link: any) => link.labelTitle,
      "strokeWidth": 1.5,
    }
  };

  return (
    <div className="flex max-h-screen min-h-screen flex-col bg-white text-black">
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
      <div className='flex flex-row justify-between'>
        <div className='flex flex-col ml-2 min-w-80 w-1/4 max-h-[85vh]'>
          <div className='font-medium text-lg flex flex-row items-center'>
            <div>
              Enter fields one at a time
            </div>
            <button className="border-2 rounded-full mx-1 p-2 items-center justify-center text-sm text-gray-500 hover:bg-gray-100" onClick={() => setIsUserInputCollapsed((prevIsUserInputCollapsed) => !prevIsUserInputCollapsed)}>{isUserInputCollapsed ? 'Expand' : 'Collapse'}</button>
          </div>
          <div className={`flex flex-col overflow-y-auto h-[40vh] mb-5 ${isUserInputCollapsed ? 'hidden' : ''}`}>
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
          </div>
          <div className='font-medium text-lg flex flex-row'>
            Turing Machine Definition
          </div>
          <div className='flex flex-col overflow-y-auto h-[40vh]'>
            <div className='flex flex-row my-2'>Q:{displayedStates}</div>
            <div className='flex flex-row my-2'>Σ:{displayedSigma}</div>
            <div className='flex flex-row my-2'>Γ:{displayedGamma}</div>
            <div className='flex flex-row my-2'>q0:<div className='ml-1'> {q0}</div></div>
            <div className='flex flex-row my-2'>qa:<div className='ml-1'> {qa}</div></div>
            <div className='flex flex-row my-2'>qr:<div className='ml-1'> {qr}</div></div>
            <div className='flex flex-col my-2'>δ:{displayedDelta}</div>
          </div>
        </div>
        <div className='flex flex-col items-center justify-between max-h-[85vh] min-h-[85vh]'>
          <label className='font-medium text-lg'>
            Specify Input:
            <input className={`border-b-2 border-gray-700 hover:bg-gray-100 mx-1 ${statusMessage === "processing..." ? 'disabled' : ''}`} type='text' value={userInput.toString()} onChange={input => {setUserInput(input.target.value); setDisplayedTape(displayTape(input.target.value, -1))}}/>
          </label>
          <div className='justify-center items-center'>
            <Graph 
              id='turing-machine'
              data={graphData}
              config={graphConfig}
            />
          </div>
          <div className={displayedTape.length > 0 ? 'flex flex-row border-4 border-black' : ''}>
            {displayedTape}
          </div>
        </div>
        <div className='flex flex-row rounded-md text-lg text-center justify-end font-medium overflow-hidden max-h-[85vh] mb-10 w-full'>
          <div className='border-2 mx-3 px-3'>
            <div className='overflow-y-auto max-h-full'>
              Configurations
              <hr />
              <ol>{configurations.map((config, idx) => <li key={idx}>{idx + 1 + ".   " + config}</li>)}</ol>
            </div>
          </div>
          <div className='border-2 mx-3 px-3'>
            Status
            <hr />
            {statusMessage}
          </div>
        </div>
        <div className='font-bold text-lg text-red-700'>
          {errorMessage}
        </div>
      </div>
    </div>
  );
}


const displayTape = (tape: string, currentIdx: number) => {
  const result: Array<ReactElement> = [];
  for (let i = 0; i < tape.length; i++) {
    if (i === currentIdx) {
      result.push(<div className='px-1 border-2 border-black bg-gray-500 text-4xl'>{tape.at(i)}</div>);
    } else {
      result.push(<div className='px-1 border-2 border-black text-4xl'>{tape.at(i)}</div>);
    }
  }
  return result;
}