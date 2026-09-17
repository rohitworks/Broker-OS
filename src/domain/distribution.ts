export function canSendProgress(x:{propertyStatus:string;requirementStatus:string;consent:boolean;optedOut:boolean;sentToday:number}){return x.propertyStatus==='ACTIVE'&&x.requirementStatus==='ACTIVE'&&x.consent&&!x.optedOut&&x.sentToday<2}
export function distributionKey(pid:string,rid:string){return `shortlist:${pid}:${rid}`}
