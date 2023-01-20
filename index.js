const express = require("express")
const bodyParser= require("body-parser")
const mysql= require("mysql")
const app = express()
const cors= require("cors")
app.use(bodyParser.json());
var flash = require('express-flash');
var randtoken = require('rand-token');
const nodemailer = require('nodemailer')
const uploadImg = require('./upload-image')
const axios =require("axios")
var fs = require('fs');
 request = require('request');

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
const connection =mysql.createConnection({
  host:'127.0.0.1',
  user: 'root',
  password: '',
  database: 'random_chatting'
})

connection.connect((err)=>{
  if(err){
    console.log("oops error during database connection")
  } else{
    console.log("db is connected")
  }
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.options("*",cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.post("/signup", ( req, res)=>{
   result=req.body
   connection.query('SELECT * from signup WHERE email=? AND password=?',[result.email,result.password],  (err,result)=>{
    if(result.length ==0){
        connection.query(`INSERT INTO signup(name, email, phone_number,password) values('${result.name}', '${result.email}', '${result.phone_number}', '${result.password}')`,  (error, result)=>{
          if(!error){
              res.status(200).json({message:"you are succesfully signup"})
            }else{
            // error.json({message :"signup successfuly"})
            res.status(400).json({message:"sorry your signup is not done."})
            }
          })
        }  else {
        res.status(400).json({message:"this user is already exist"})
    }
  })
})
app.post("/login", (req, res)=>{
  param=req.body
  connection.query('SELECT * from signup WHERE email=? AND password=?',[param.email,param.password],  (err,result)=>{
    if(!err && result.length !=0){
      res.status(200).json({ ...result[0], message:"login successfuly" })
    }else{
     res.status(400).json({message:"not login"})
    }
  })
})


function sendEmailFun(email, token) {
  var getEmail= email
  var getToken= token
   var createMail= nodemailer.createTransport ({
      service:'Gmail',
          auth:{
            user:'',
            pass:''
          }
    })
    var mailOption={
      from:'hikmatullahmcs@gmail.com',
      to:`${getEmail}`,
      subject: 'Reset Password Link - Tutsmake.com',
      text: `http://localhost:4000/reset-password?token=${token} `
    };
    createMail.sendMail(mailOption, (err, info)=>{
      if(err){
        console.log("erorr", err)
      }else{
        console.log("success")
      }
    })
} 
// send email to user gmail account and ya you can verify that
app.post('/reset-password-email', (req, res, next)=>{
  var email=req.body.email
  // connection.query("select * from signup WHERE email=?", email, (error, result)=>{
  //   if(result){
      var token= randtoken.generate(20)
     
      sendEmailFun(email, token)
  //     var sent= sendEmailFun(email, token)
  //     if(sent){
  //         var data={
  //           token:token
  //         }
  //         connection.query("UPDATE signup SET ? WHERE email=?",[email, data], (err, result)=>{
  //           if(!err){
  //             res.status(400).json({message:"The reset password link has been sent to your email address"})
  //           }
  //         })
  //       } else {
  //         res.status(400).json({message: 'Something goes to wrong. Please try again'});
  //     }
  //   }
  //   // res.redirect('/');
  // })
})


// upate password after redirection from gmail
app.post('/api/update-password',  (req, res)=>{
     const password= req.body.password
     const uid= req.body.userid
     connection.query('SELECT * from signup WHERE id=?',uid,  (error,checkResult)=>{
      if(checkResult.length !==0){
          connection.query(`UPDATE signup SET password=${password} WHERE id= ${uid}`, ( err, result)=>{
            if(!err){
                res.status(200).json({message:"You have successfuly update your password."})
            } else{
              res.status(400).json({message:"Your password not update."})
            }
          })
        } else {
         res.status(400).json({message:"user not found"})
        }
    })
})
  

// user profile api
app.post('/api/profile', (req, res)=>{
  const bodyData=req.body
  connection.query(`INSERT INTO userprofile( name, country,dob, gender, uid) values('${bodyData.name}', '${bodyData.country}', '${bodyData.dob}', '${bodyData.gender}', '${bodyData.uid}')`,  (err, result)=>{
    if(!err){
      res.status(200).json({message:"profile create successfuly."})
    }else{
      res.status(400).json({message:"profile not created try again."})
    }
  })
})


// upate profile of user api
app.post('/api/update-profile',  (req, res)=>{
  const udata= req.body
    connection.query('SELECT * from userprofile WHERE uid=?',udata.uid,  (error,checkResult)=>{
     if(checkResult.length !==0){
         connection.query(`UPDATE userprofile SET 'name'='${udata.name}','country'='${udata.country}','dob'='${udata.dob}','gender'='${udata.gender}','uid'='${udata.uid}' WHERE uid= ${uid}`, ( err, result)=>{
            if(!err){
                res.status(200).json({message:"Your profile has been successfuly update."})
             } else{
              res.status(400).json({message:"Your profile not updated."})
            }
          })
        } else {
      res.status(400).json({message:"user not found"})
     }
  })
})

// feedback or issue
app.post('/api/feedback-issue', (req, res)=>{
  const bodyData= req.body
  connection.query(`INSERT INTO INTO feedback( feedbackOrIssue, description, uid)  values('${bodyData.feedbackOrIssue}', '${bodyData.description}', '${bodyData.uid}')`,  (err, result)=>{
    if(!err){
      res.status(200).json({message:"feedback or issue has been submitted successfuly."})
    }else{
      res.status(400).json({message:"feedback or issue not submitted."})
    }
  })
})

// random videos
app.get("/api/random-videos", (req, res)=>{
   res.status(200).json({video_src:[
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
      'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4'],
        message:"Random Video exist."})  
})

app.get('/', (req, res, next)=>{
 console.log('hrllo')
    res.status(200).json({message:"successfuly uploaded", fileUrl: 'http://localhost:6000/uploads/image.jpg'});
 
 
})







// flags objects
// const flages ={
//   "ad": "Andorra",
//   "ae": "United Arab Emirates",
//   "af": "Afghanistan",
//   "ag": "Antigua and Barbuda",
//   "ai": "Anguilla",
//   "al": "Albania",
//   "am": "Armenia",
//   "ao": "Angola",
//   "aq": "Antarctica",
//   "ar": "Argentina",
//   "as": "American Samoa",
//   "at": "Austria",
//   "au": "Australia",
//   "aw": "Aruba",
//   "ax": "Åland Islands",
//   "az": "Azerbaijan",
//   "ba": "Bosnia and Herzegovina",
//   "bb": "Barbados",
//   "bd": "Bangladesh",
//   "be": "Belgium",
//   "bf": "Burkina Faso",
//   "bg": "Bulgaria",
//   "bh": "Bahrain",
//   "bi": "Burundi",
//   "bj": "Benin",
//   "bl": "Saint Barthélemy",
//   "bm": "Bermuda",
//   "bn": "Brunei",
//   "bo": "Bolivia",
//   "bq": "Caribbean Netherlands",
//   "br": "Brazil",
//   "bs": "Bahamas",
//   "bt": "Bhutan",
//   "bv": "Bouvet Island",
//   "bw": "Botswana",
//   "by": "Belarus",
//   "bz": "Belize",
//   "ca": "Canada",
//   "cc": "Cocos (Keeling) Islands",
//   "cd": "DR Congo",
//   "cf": "Central African Republic",
//   "cg": "Republic of the Congo",
//   "ch": "Switzerland",
//   "ci": "Côte d'Ivoire (Ivory Coast)",
//   "ck": "Cook Islands",
//   "cl": "Chile",
//   "cm": "Cameroon",
//   "cn": "China",
//   "co": "Colombia",
//   "cr": "Costa Rica",
//   "cu": "Cuba",
//   "cv": "Cape Verde",
//   "cw": "Curaçao",
//   "cx": "Christmas Island",
//   "cy": "Cyprus",
//   "cz": "Czechia",
//   "de": "Germany",
//   "dj": "Djibouti",
//   "dk": "Denmark",
//   "dm": "Dominica",
//   "do": "Dominican Republic",
//   "dz": "Algeria",
//   "ec": "Ecuador",
//   "ee": "Estonia",
//   "eg": "Egypt",
//   "eh": "Western Sahara",
//   "er": "Eritrea",
//   "es": "Spain",
//   "et": "Ethiopia",
//   "eu": "European Union",
//   "fi": "Finland",
//   "fj": "Fiji",
//   "fk": "Falkland Islands",
//   "fm": "Micronesia",
//   "fo": "Faroe Islands",
//   "fr": "France",
//   "ga": "Gabon",
//   "gb": "United Kingdom",
//   "gb-eng": "England",
//   "gb-nir": "Northern Ireland",
//   "gb-sct": "Scotland",
//   "gb-wls": "Wales",
//   gd: "Grenada",
//   ge: "Georgia",
//   gf: "French Guiana",
//   gg: "Guernsey",
//   gh: "Ghana",
//   gi: "Gibraltar",
//   gl: "Greenland",
//   gm: "Gambia",
//   gn: "Guinea",
//   gp: "Guadeloupe",
//   gq: "Equatorial Guinea",
//   gr: "Greece",
//   gs: "South Georgia",
//   gt: "Guatemala",
//   gu: "Guam",
//   gw: "Guinea-Bissau",
//   gy: "Guyana",
//   hk: "Hong Kong",
//   hm: "Heard Island and McDonald Islands",
//   hn: "Honduras",
//   hr: "Croatia",
//   ht: "Haiti",
//   hu: "Hungary",
//   id: "Indonesia",
//   ie: "Ireland",
//   il: "Israel",
//   im: "Isle of Man",
//   in: "India",
//   io: "British Indian Ocean Territory",
//   iq: "Iraq",
//   ir: "Iran",
//   is: "Iceland",
//   it: "Italy",
//   je: "Jersey",
//   jm: "Jamaica",
//   jo: "Jordan",
//   jp: "Japan",
//   ke: "Kenya",
//   kg: "Kyrgyzstan",
//   kh: "Cambodia",
//   ki: "Kiribati",
//   km: "Comoros",
//   kn: "Saint Kitts and Nevis",
//   kp: "North Korea",
//   kr: "South Korea",
//   kw: "Kuwait",
//   ky: "Cayman Islands",
//   kz: "Kazakhstan",
//   la: "Laos",
//   lb: "Lebanon",
//   lc: "Saint Lucia",
//   li: "Liechtenstein",
//   lk: "Sri Lanka",
//   lr: "Liberia",
//   ls: "Lesotho",
//   lt: "Lithuania",
//   lu: "Luxembourg",
//   lv: "Latvia",
//   ly: "Libya",
//   ma: "Morocco",
//   mc: "Monaco",
//   md: "Moldova",
//   me: "Montenegro",
//   mf: "Saint Martin",
//   mg: "Madagascar",
//   mh: "Marshall Islands",
//   mk: "North Macedonia",
//   ml: "Mali",
//   mm: "Myanmar",
//   mn: "Mongolia",
//   mo: "Macau",
//   mp: "Northern Mariana Islands",
//   mq: "Martinique",
//   mr: "Mauritania",
//   ms: "Montserrat",
//   mt: "Malta",
//   mu: "Mauritius",
//   mv: "Maldives",
//   mw: "Malawi",
//   mx: "Mexico",
//   my: "Malaysia",
//   mz: "Mozambique",
//   na: "Namibia",
//   nc: "New Caledonia",
//   ne: "Niger",
//   nf: "Norfolk Island",
//   ng: "Nigeria",
//   ni: "Nicaragua",
//   nl: "Netherlands",
//   no: "Norway",
//   np: "Nepal",
//   nr: "Nauru",
//   nu: "Niue",
//   nz: "New Zealand",
//   om: "Oman",
//   pa: "Panama",
//   pe: "Peru",
//   pf: "French Polynesia",
//   pg: "Papua New Guinea",
//   ph: "Philippines",
//   pk: "Pakistan",
//   pl: "Poland",
//   pm: "Saint Pierre and Miquelon",
//   pn: "Pitcairn Islands",
//   pr: "Puerto Rico",
//   ps: "Palestine",
//   pt: "Portugal",
//   pw: "Palau",
//   py: "Paraguay",
//   qa: "Qatar",
//   re: "Réunion",
//   ro: "Romania",
//   rs: "Serbia",
//   ru: "Russia",
//   rw: "Rwanda",
//   sa: "Saudi Arabia",
//   sb: "Solomon Islands",
//   sc: "Seychelles",
//   sd: "Sudan",
//   se: "Sweden",
//   sg: "Singapore",
//   sh: "Saint Helena, Ascension and Tristan da Cunha",
//   si: "Slovenia",
//   sj: "Svalbard and Jan Mayen",
//   sk: "Slovakia",
//   sl: "Sierra Leone",
//   sm: "San Marino",
//   sn: "Senegal",
//   so: "Somalia",
//   sr: "Suriname",
//   ss: "South Sudan",
//   st: "São Tomé and Príncipe",
//   sv: "El Salvador",
//   sx: "Sint Maarten",
//   sy: "Syria",
//   sz: "Eswatini (Swaziland)",
//   tc: "Turks and Caicos Islands",
//   td: "Chad",
//   tf: "French Southern and Antarctic Lands",
//   tg: "Togo",
//   th: "Thailand",
//   tj: "Tajikistan",
//   tk: "Tokelau",
//   tl: "Timor-Leste",
//   tm: "Turkmenistan",
//   tn: "Tunisia",
//   to: "Tonga",
//   tr: "Turkey",
//   tt: "Trinidad and Tobago",
//   tv: "Tuvalu",
//   tw: "Taiwan",
//   tz: "Tanzania",
//   ua: "Ukraine",
//   ug: "Uganda",
//   um: "United States Minor Outlying Islands",
//   un: "United Nations",
//   us: "United States",
//   "us-ak": "Alaska",
//   "us-al": "Alabama",
//   "us-ar": "Arkansas",
//   "us-az": "Arizona",
//   "us-ca": "California",
//   "us-co": "Colorado",
//   "us-ct": "Connecticut",
//   "us-de": "Delaware",
//   "us-fl": "Florida",
//   "us-ga": "Georgia",
//   "us-hi": "Hawaii",
//   "us-ia": "Iowa",
//   "us-id": "Idaho",
//   "us-il": "Illinois",
//   "us-in": "Indiana",
//   "us-ks": "Kansas",
//   "us-ky": "Kentucky",
//   "us-la": "Louisiana",
//   "us-ma": "Massachusetts",
//   "us-md": "Maryland",
//   "us-me": "Maine",
//   "us-mi": "Michigan",
//   "us-mn": "Minnesota",
//   "us-mo": "Missouri",
//   "us-ms": "Mississippi",
//   "us-mt": "Montana",
//   "us-nc": "North Carolina",
//   "us-nd": "North Dakota",
//   "us-ne": "Nebraska",
//   "us-nh": "New Hampshire",
//   "us-nj": "New Jersey",
//   "us-nm": "New Mexico",
//   "us-nv": "Nevada",
//   "us-ny": "New York",
//   "us-oh": "Ohio",
//   "us-ok": "Oklahoma",
//   "us-or": "Oregon",
//   "us-pa": "Pennsylvania",
//   "us-ri": "Rhode Island",
//   "us-sc": "South Carolina",
//   "us-sd": "South Dakota",
//   "us-tn": "Tennessee",
//   "us-tx": "Texas",
//   "us-ut": "Utah",
//   "us-va": "Virginia",
//   "us-vt": "Vermont",
//   "us-wa": "Washington",
//   "us-wi": "Wisconsin",
//   "us-wv": "West Virginia",
//   "us-wy": "Wyoming",
//   uy: "Uruguay",
//   uz: "Uzbekistan",
//   va: "Vatican City (Holy See)",
//   vc: "Saint Vincent and the Grenadines",
//   ve: "Venezuela",
//   vg: "British Virgin Islands",
//   vi: "United States Virgin Islands",
//   vn: "Vietnam",
//   vu: "Vanuatu",
//   wf: "Wallis and Futuna",
//   ws: "Samoa",
//   xk: "Kosovo",
//   ye: "Yemen",
//   yt: "Mayotte",
//   za: "South Africa",
//   zm: "Zambia",
//   zw: "Zimbabwe"
//   }
//   async function download(url, dest) {
//     /* Create an empty file where we can save data */
//     const file = fs.createWriteStream(dest);
//     /* Using Promises so that we can use the ASYNC AWAIT syntax */
//     await new Promise((resolve, reject) => {
//       request({
//         /* Here you should specify the exact link to the file you are trying to download */
//         uri: url,
//         gzip: true,
//       }).pipe(file)
//           .on('finish', async () => {
//             console.log(`The flag is finished downloading.`);
//             resolve();
//           })
//           .on('error', (error) => {
//             reject(error);
//           });
//     })
//         .catch((error) => {
//           console.log(`Something happened: ${error}`);
//         });
//   }
// for (let key in flages){
//   (async () => {
//       const data = await download(`https://flagcdn.com/256x192/${key}.png`, `./flags/${flages[key]}.jpg`);
//       console.log(data); // The file is finished downloading.
//     })();
// }

 
 
axios({
  url: 'https://newadminapi-dev.findanexpert.net/api/Services/GetAllServicesForHomePage/1/1/4',
  method: 'get',
}).then(function (ddsfksd) {
  console.log(JSON.stringify(ddsfksd.data));
})
app.listen(6000)


