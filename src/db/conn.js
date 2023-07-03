const mongoose = require("mongoose");
//mongodb+srv://aafhanjaved:VvF4L4ZYJKazpOep@practice.vv0wgt3.mongodb.net/?retryWrites=true&w=majority
// mongodb://127.0.0.1:27017/affandb2
mongoose.connect('mongodb://127.0.0.1:27017/affandb2',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(()=>{
    console.log(`Connectin succcesfull`)
}).catch((err)=>{
    console.log(err);
}); 