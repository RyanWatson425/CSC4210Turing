'use client'
import { useState, useEffect } from 'react';
import { defaultData } from './data/defaultMachine';

export default function Home() {
  //Q
  const [states, setStates] = useState<Set<String>>(new Set());
  //Σ
  const [sigma, setSigma] = useState<Set<String>>(new Set());
  //Γ
  const [gamma, setGamma] = useState<Set<String>>(new Set());
  //δ: [Q, Γ]: [Q, Γ, 'L' | 'R'] 
  const [delta, setDelta] = useState<Map<Array<String>, Array<String>>>(new Map());
  //q0
  const [q0, setQ0] = useState<String>("");
  //qa
  const [qa, setQA] = useState<String>("");
  //qr
  const [qr, setQR] = useState<String>("");

  useEffect(() => {
    setStates(new Set(defaultData.Q));
    setSigma(new Set(defaultData.sigma));
    setGamma(new Set(defaultData.gamma));
    setQ0(defaultData.q0);
    setQA(defaultData.qa);
    setQR(defaultData.qr);
    const defaultDelta = new Map();
    defaultData.delta.forEach((rule) => defaultDelta.set(rule[0], rule[1]));
    setDelta(defaultDelta);
  }, []);



  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <div>
        Create a Turing Machine and watch it run!
      </div>
      <div className='flex flex-row'>Q:{Array.from(states).map((state) => <div> {state}</div>)}</div>
      <div className='flex flex-row'>Σ:{Array.from(sigma).map((symbol) => <div> {symbol}</div>)}</div>
      <div className='flex flex-row'>Γ:{Array.from(gamma).map((symbol) => <div> {symbol}</div>)}</div>
      <div className='flex flex-row'>q0:<div> {q0}</div></div>
      <div className='flex flex-row'>qa:<div> {qa}</div></div>
      <div className='flex flex-row'>qr:<div> {qr}</div></div>
      <div>δ: {Array.from(delta).map((rule) => <div> {rule[0][0]}, {rule[0][1]} {'->'} {rule[1][0]}, {rule[1][1]}, {rule[1][2]}</div>)}</div>
    </main>
  );
}