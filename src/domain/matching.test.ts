import {expect,test}from"vitest";import{scoreMatch}from"./matching";
const base={transactionType:"RENT",localities:["Whitefield"],types:["Apartment"],bhkMin:2,bhkMax:2,budgetMin:35000,budgetMax:48000,parking:true,property:{transactionType:"RENT",locality:"Whitefield",propertyType:"Apartment",bhk:2,price:42000,parking:true}};
test("scores explainable exact match",()=>{const x=scoreMatch(base);expect(x.score).toBe(100);expect(x.eligible).toBe(true);expect(x.reasons).toContain("Within budget")});
test("rejects incompatible listing",()=>{const x=scoreMatch({...base,property:{...base.property,locality:"Indiranagar",price:90000,parking:false}});expect(x.eligible).toBe(false)});
