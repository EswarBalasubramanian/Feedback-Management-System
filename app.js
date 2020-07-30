//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//MONGOOSE and MONGO DB = CONNECTION
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/feedbackDB", {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const scoreSchema = {
//   scored: Number
// };

const staffSchema = {
  staffName: {
    type: String,
    required: [true,"PLEASE ENTER THE NAME OF STAFF"]
  },
  className: {
    type: String,
    required: [true,"PLEASE ENTER THE CLASS NAME"]
  },
  rating: Number,
  scores: [Number]
};

const questionSchema = {
  questionName: String,
  staffs: [staffSchema]
};

const formSchema = new mongoose.Schema({
  formName: {
    type:String,
    required: [true,"PLEASE ENTER THE NAME OF FORM"]
  },
  questions: [questionSchema],
  responses: Number
});

const Form = mongoose.model("form", formSchema);
const Staff = mongoose.model("staff", staffSchema);
const Question = mongoose.model("question", questionSchema);
// const Score = mongoose.model("score", scoreSchema);
// const Class = mongoose.model("class", classSchema);

const question1 = new Question ({
  questionName: "Comes to class on time",

});
const question2 = new Question({
  questionName: "Makes the students understand the concepts clearly",

});
const question3 = new Question({
  questionName: "Speaks clearly and audibly",

});
const question4 = new Question({
  questionName: "Draws and writes legibly",

});
const question5 = new Question({
  questionName: "Use appropriate teaching methods and real time examples",

});
const question6 = new Question({
  questionName: "Courteous and impartial to students",

});
const question7 = new Question({
  questionName: "Prompt in valuating answer scripts and provides feedback on performance",

});
const question8 = new Question({
  questionName: "Maintains Perfect discipline",

});
const question9 = new Question({
  questionName: "Encourages and Appreciate students wherever possible",

});
const question10 = new Question({
  questionName: "Overall rating of quality of teaching",

});

const defaultQuestions = [ question1, question2, question3, question4, question5, question6, question7, question8, question9, question10 ];

let className = "";
let setLength = 0;

app.get("/", function(req, res) {
  const classNameList = [];

  Staff.find(function(err, staffs){
    if(!err) {
      staffs.forEach(function(staff){
        if(!classNameList.includes(staff.className)){

          classNameList.push(staff.className);
        }
      });
      res.render("home", {classNameList: classNameList});
    }
});
});

app.get("/home", function(req, res) {
  res.redirect("/");
});

app.get("/list", function(req, res) {

  const formNames = [];

  Form.find(function(err, foundLists){
    if(!err){
      foundLists.forEach(function(list){
        formNames.push(list.formName);
      });
      res.render("list", {formNames: formNames});
    }
    else{
      console.log(err);
      //log ERR
    }
  });

});

app.post("/entry", function(req, res){
  const formName = req.body.formName;
  const defaultQuestion = [];
  const staffName = [];

  Form.find({formName: formName},function(err, foundForms){

    foundForms.forEach(function(form){
      form.questions.forEach(function(question){
        defaultQuestion.push(question.questionName);
      });
      form.questions.forEach(function(question){
        question.staffs.forEach(function(staff){
          if(!staffName.includes(staff.staffName))
          {
            staffName.push(staff.staffName);
          }
        });
      });
    });
      res.render("entry", {defaultQuestions: defaultQuestion, staffNames: staffName, formName: formName});
  });

});

app.get("/results", function(req, res) {
  const formNameList = [];

  Form.find(function(err, forms){
    if(!err) {
      forms.forEach(function(form){
          formNameList.push(form.formName);
      });
      res.render("resultList", {formNameList: formNameList});
    }
    else{
      console.log(err);
    }
  });
});

app.get("/staffs", function(req, res) {
  res.render("staffs");
});

app.get("/success", function(req, res){
  res.render("success");
});

app.get("/show", function(req,res){
  const classNameList = [];

  Staff.find(function(err, staffs){
    if(!err) {
      staffs.forEach(function(staff){
        if(!classNameList.includes(staff.className)){

          classNameList.push(staff.className);
        }
      });
      res.render("show", {classNameList: classNameList});
    }
    else{
      console.log(err);
    }
  });
});

app.post("/options", function(req, res){
  const formName = req.body.formName;
  res.render("options", {formName:formName});
});

app.post("/create", function(req, res){

  const siteTitle = req.body.siteTitle;

  if(siteTitle === "staffs")
  {
    const staffArr = req.body.staffArr;
    Staff.findOne({className: className}, function(err, foundList){
      if(!err){
        if(!foundList){

          for(let i=0;i<setLength;i++)
          {
            const staff = new Staff({
              staffName: staffArr[i],
              className: className,
              rating: 0
            });

            staff.save();
          }



          res.redirect("/success");
        }
        else{
          //IF LIST IS FOUND
        }
      }
    });
  }
  else{
    if(req.body.checkbox === "on")
    {
      const formName = req.body.formName;
      const className = req.body.className;
      const defaultStaffs = [];

      Staff.find({className: className}, function(err, foundLists){
        if(!err){
          foundLists.forEach(function(list){
            defaultStaffs.push(list);
          });

          Form.findOne({formName: formName}, function(err, foundList){
            if(!err){
              if(!foundList){

                const form = new Form({
                  formName: formName,
                  questions: defaultQuestions,
                  responses: 0
                });

                form.questions.forEach(function(question){
                  defaultStaffs.forEach(function(staff){
                    question.staffs.push(staff);
                  });
                });


                form.save();
                res.redirect("/success");

              }
              else{
                //TO INFORM USER TO DELETE PREVIOUS FORM
              }
            }
          });
          }
        else {
          console.log(err);
        }
      });
    }
  }

});

app.post("/staffList", function(req, res){
  className = req.body.className;
  setLength = req.body.setLength;

  res.render("staffList", {setLength: setLength});
});

app.post("/response", function(req, res){

  const formName = req.body.formName;
  delete req.body[formName];

  Form.find({formName: formName}, function(err, foundForm){
    foundForm.forEach(function(form){
      form.responses++;
      form.questions.forEach(function(question){
        question.staffs.forEach(function(staff){
          staff.rating = staff.rating + Number(Object.values(req.body)[0]);

          staff.scores.push(Object.values(req.body)[0]);

          delete req.body[Object.keys(req.body)[0]];
        });
      });
      form.save();
    });
    className = "";
    setLength = 0;
    res.redirect("/success");
  });
});

app.post("/result", function(req, res){
  const formName = req.body.formName;
  Form.findOne({formName: formName}, function(err, foundForm){
    res.render("result", {form:foundForm});
  });
});

app.post("/staffresultlist", function(req, res){
  const formName = req.body.formName;
  const staffName = [];
  Form.find({formName: formName}, function(err, foundForms){

    foundForms.forEach(function(form){

      form.questions.forEach(function(question){
        question.staffs.forEach(function(staff){
          if(!staffName.includes(staff.staffName))
          {
            staffName.push(staff.staffName);
          }
          // else{
          //break;;
          // }
        });
      });
    });
      res.render("fullList", { staffNames: staffName, formName:formName});
  });
});

app.post("/oddresult", function(req, res){
  const staffName = req.body.staffName;
  const totalScores = [] ;
  Form.findOne({formName: req.body.formName}, function(err, foundForm){
    foundForm.questions.forEach(function(question){
      question.staffs.forEach(function(staff){
        if(staff.staffName === staffName)
        {
          totalScores.push(staff.scores);
          // console.log(staff.scores);
        }
      });
    });
    res.render("oddresult", {form: foundForm, scores: totalScores,staffName: staffName});
  });


});

app.post("/list",function(req, res){
  const className = req.body.className;
    Staff.find({className: className}, function(err, foundStaffs){
      res.render("editStaffs", {staffs: foundStaffs, className: className});
    });
});

app.post("/createone", function(req, res){
  const newStaff = req.body.newStaff;
  const className = req.body.className;
  const staff = new Staff({
    staffName: newStaff,
    className: className,
    rating: 0
  });

  staff.save();
  res.redirect("/show");
});

app.post("/deleteone", function(req, res){
  const staffName = req.body.checkbox;
  const formName = req.body.formName;
  const className = req.body.sclassName;

  if(!formName && !className)
  {
    Staff.deleteOne({staffName: staffName}, function(err, foundStaffs){
      res.redirect("/show");
    });
  }
  else if(!className && !staffName){
    Form.deleteOne({formName: formName},function(err, foundStaffs){
      res.redirect("/results");
    });
  }
  else{
    Staff.deleteMany({className: className}, function(err, foundStaffs){
      res.redirect("/success");
    });
  }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
