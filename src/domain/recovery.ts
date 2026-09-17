export function retryDelayMinutes(attempt:number){return Math.min(60,2**Math.max(0,attempt-1));}
export function isRecoverableStatus(status:string){return ['FAILED','UNDELIVERED','TEMPORARY_ERROR'].includes(status);}
