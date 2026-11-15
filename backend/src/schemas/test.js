const sgToday = new Date().toLocaleDateString('en-CA',{timeZone:"Asia/Singapore"})
dob= '2008-11-16'
cutOff = `${Number(sgToday.slice(0,4))-18}${sgToday.slice(4)}`
console.log(cutOff)
console.log(dob<=cutOff)
