const app = require('./app')
const { startDealTimers } = require("./jobs/dealTimers");
const { TIMER_INTERVAL_MIN } = require("./config/deals");
const PORT = process.env.PORT ||5000
//Start the server
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
startDealTimers(TIMER_INTERVAL_MIN)